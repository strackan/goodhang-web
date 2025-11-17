'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import '../app/glitch-v2.css';
import {
  GlitchPhase,
  getPhaseFromElapsed,
  corruptCharacter,
  visitTracking,
  getGlitchIntensity,
  GLITCH_TIMING,
  FLASH_SCHEDULE,
  BACKGROUND_SCHEDULE
} from '@/utils/glitchSequence';
import { getRandomImagePath } from '@/utils/glitchImages';
import { DEFAULT_QUOTE, TRIANGLE_POSITIONS } from '@/lib/constants/glitchIntroConfig';
import { generateSubliminalMessage } from '@/lib/utils/glitch/glitchMessages';
import { getPhaseClass as getPhaseClassName, getTextClasses as getTextClassNames } from '@/lib/utils/glitch/glitchClassNames';

interface GlitchIntroProps {
  onComplete: () => void;
  quote?: string;
}

export function GlitchIntroV2({ onComplete, quote = DEFAULT_QUOTE }: GlitchIntroProps) {
  const [phase, setPhase] = useState<GlitchPhase>(GlitchPhase.INITIAL);
  const [_elapsed, setElapsed] = useState(0);
  const [displayText, setDisplayText] = useState(quote);
  const [activeFlashes, setActiveFlashes] = useState<Array<{index: number; zone: string; type: string}>>([]);
  const [activeBackground, setActiveBackground] = useState<{index: number; type: string} | null>(null);
  const [showWarning, setShowWarning] = useState(true);
  const [isCompressed, setIsCompressed] = useState(false);
  const [subliminalMessage, setSubliminalMessage] = useState('');
  const [showSubliminal, setShowSubliminal] = useState(false);
  const [flashBackground, setFlashBackground] = useState(false);
  const [_contentLoaded, setContentLoaded] = useState(false);
  const isAliveRef = useRef(true); // Track if component is still mounted and active

  // Pre-assign random images to each flash event (macabre/social overlays)
  const flashImages = useMemo(() => {
    try {
      return FLASH_SCHEDULE.map(flash => ({
        path: getRandomImagePath(flash.type as 'macabre' | 'social'),
        type: flash.type
      }));
    } catch (error) {
      console.error('Failed to load flash images:', error);
      return [];
    }
  }, []);

  // Pre-assign random background images (TECH only)
  const backgroundImages = useMemo(() => {
    try {
      return BACKGROUND_SCHEDULE.map(bg => ({
        path: getRandomImagePath('tech'),
        type: bg.type
      }));
    } catch (error) {
      console.error('Failed to load background images:', error);
      return [];
    }
  }, []);

  // Check if we should skip or compress
  useEffect(() => {
    console.log('[GlitchIntroV2] Component mounted');

    if (visitTracking.shouldSkipGlitch()) {
      console.log('[GlitchIntroV2] Skipping glitch intro');
      // Clear emergency skip flag if it was set
      visitTracking.clearEmergencySkip();
      onComplete();
      return;
    }

    if (visitTracking.shouldUseCompressed()) {
      console.log('[GlitchIntroV2] Using compressed animation');
      setIsCompressed(true);
    } else {
      console.log('[GlitchIntroV2] Using full animation');
    }

    visitTracking.markCurrentSession();

    // Mark content as loaded after a brief delay
    const loadTimer = setTimeout(() => {
      console.log('[GlitchIntroV2] Content loaded');
      setContentLoaded(true);
      // Clear emergency skip flag since we loaded successfully
      visitTracking.clearEmergencySkip();
    }, 100);

    return () => clearTimeout(loadTimer);
  }, [onComplete]);

  // Emergency refresh if page gets stuck (check if glitch intro hangs)
  useEffect(() => {
    if (visitTracking.shouldSkipGlitch()) return;

    console.log('[GlitchIntroV2] Starting emergency timeout monitor (3s)');

    // Check after 3 seconds if content has rendered
    const emergencyTimeout = setTimeout(() => {
      if (!isAliveRef.current) {
        console.log('[GlitchIntroV2] Emergency timeout passed - component already completed');
        return;
      }

      // Check if the main content (quote) has actually rendered to the DOM
      const mainContent = document.querySelector('.glitch-content .glitch-quote');

      if (!mainContent) {
        // No content rendered = we're hanging
        console.error('[GlitchIntroV2] Emergency timeout triggered - no content rendered after 3s, forcing refresh');
        localStorage.setItem('goodhang_glitch_emergency_skip', 'true');
        window.location.reload();
      } else {
        // Content is showing, glitch is playing normally - let it continue for full 15s
        console.log('[GlitchIntroV2] Content rendered successfully, glitch playing normally');
      }
    }, 3000); // 3 second threshold

    return () => {
      clearTimeout(emergencyTimeout);
      console.log('[GlitchIntroV2] Emergency timeout monitor cleaned up');
    };
  }, []);

  // Prevent body scroll during intro
  useEffect(() => {
    if (visitTracking.shouldSkipGlitch()) return;

    // Disable scroll
    document.body.style.overflow = 'hidden';

    return () => {
      // Re-enable scroll when component unmounts
      document.body.style.overflow = '';
    };
  }, []);

  // Main animation loop
  useEffect(() => {
    if (visitTracking.shouldSkipGlitch()) return;

    const maxTime = isCompressed ? GLITCH_TIMING.COMPRESSED : GLITCH_TIMING.TOTAL;
    let animationFrame: number;
    const startTime = Date.now();
    let lastUpdateTime = Date.now();

    // Failsafe timeout - force complete after max time + buffer
    const failsafeTimeout = setTimeout(() => {
      console.warn('Glitch animation failsafe triggered');
      isAliveRef.current = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      visitTracking.markGlitchSeen();
      document.body.style.overflow = '';
      onComplete();
    }, maxTime + 1000); // 1 second buffer

    // Watchdog timer - detect if animation loop stops running
    const watchdogInterval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdateTime;
      if (timeSinceLastUpdate > 2000) {
        console.error('Animation loop appears stuck - forcing completion');
        isAliveRef.current = false;
        clearInterval(watchdogInterval);
        clearTimeout(failsafeTimeout);
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
        visitTracking.markGlitchSeen();
        document.body.style.overflow = '';
        onComplete();
      }
    }, 1000);

    const animate = () => {
      const now = Date.now();
      const newElapsed = now - startTime;
      lastUpdateTime = now; // Update watchdog

      if (newElapsed >= maxTime) {
        console.log('[GlitchIntroV2] Animation complete naturally');
        isAliveRef.current = false; // Mark as complete
        clearTimeout(failsafeTimeout);
        clearInterval(watchdogInterval);
        visitTracking.markGlitchSeen();
        document.body.style.overflow = ''; // Re-enable scroll
        onComplete();
        return;
      }

      setElapsed(newElapsed);

      // Update phase
      const newPhase = getPhaseFromElapsed(newElapsed);
      setPhase(newPhase);

      // Check for active background image
      if (!isCompressed) {
        const activeBg = BACKGROUND_SCHEDULE.find((bg, _index) => {
          return newElapsed >= bg.time && newElapsed < bg.time + bg.duration;
        });

        if (activeBg) {
          setActiveBackground({
            index: BACKGROUND_SCHEDULE.indexOf(activeBg),
            type: activeBg.type
          });
        } else {
          setActiveBackground(null);
        }

        // Check for active overlay flashes
        const active = FLASH_SCHEDULE.filter((flash, _index) => {
          return newElapsed >= flash.time && newElapsed < flash.time + flash.duration;
        }).map((flash, _index) => ({
          index: FLASH_SCHEDULE.indexOf(flash),
          zone: flash.zone || 'top-left',
          type: flash.type
        }));

        setActiveFlashes(active);
      }

      // Corrupt text occasionally (not constantly)
      const intensity = getGlitchIntensity(newPhase);
      if (intensity > 0 && Math.random() < 0.15) {  // Reduced frequency
        setDisplayText(corruptCharacter(quote, intensity));
      } else if (Math.random() < 0.05) {
        setDisplayText(quote);  // Restore text occasionally
      }

      // Subliminal messages during CHAOS phase
      if (newPhase === GlitchPhase.CHAOS) {
        if (Math.random() > 0.92) {  // 8% chance per frame
          const randomMsg = generateSubliminalMessage();
          setSubliminalMessage(randomMsg);
          setShowSubliminal(true);
          setTimeout(() => setShowSubliminal(false), 100);  // 100ms flash
        }

        // Random background flashes
        if (Math.random() > 0.95) {  // 5% chance per frame
          setFlashBackground(true);
          setTimeout(() => setFlashBackground(false), 80);
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      clearTimeout(failsafeTimeout);
      clearInterval(watchdogInterval);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onComplete, quote, isCompressed]);

  // Skip handler
  const handleSkip = useCallback(() => {
    console.log('[GlitchIntroV2] Skip button clicked');
    isAliveRef.current = false; // Mark as complete
    visitTracking.markGlitchSeen();
    document.body.style.overflow = ''; // Re-enable scroll
    onComplete();
  }, [onComplete]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  // Fade in skip button after 3 seconds
  useEffect(() => {
    const fadeInTimer = setTimeout(() => {
      setShowWarning(true);
    }, 3000);

    return () => {
      clearTimeout(fadeInTimer);
    };
  }, []);

  if (visitTracking.shouldSkipGlitch()) {
    return null;
  }

  const showEdgeCorruption = phase !== GlitchPhase.INITIAL && phase !== GlitchPhase.RESOLUTION;
  const showTriangles = phase === GlitchPhase.CORRUPTION || phase === GlitchPhase.CHAOS;
  const showBackgroundEffects = phase !== GlitchPhase.INITIAL;

  const containerStyle = flashBackground ? { background: Math.random() > 0.5 ? '#ffffff' : '#000000' } : {};

  return (
    <div className={`glitch-intro-container ${getPhaseClassName(phase)}`} style={containerStyle}>
      {/* Full-screen background image oscillation */}
      {activeBackground && backgroundImages[activeBackground.index] && (
        <div className="glitch-background-image">
          <Image
            src={backgroundImages[activeBackground.index]?.path || ''}
            alt=""
            fill
            sizes="100vw"
            style={{
              objectFit: 'cover',
              opacity: 0.3,
              filter: 'blur(1px) contrast(1.2) saturate(0.8)',
            }}
            className="background-pulse"
            priority={false}
            unoptimized
          />
        </div>
      )}

      {/* Film Grain - Always visible */}
      <div className="film-grain" />

      {/* CRT Effects */}
      <div className="crt-bulge" />
      {showBackgroundEffects && <div className="crt-scanlines" />}

      {/* VHS Tape Artifacts */}
      {showBackgroundEffects && (
        <>
          <div className="vhs-tape-wrinkle" style={{ animationDelay: '0s' }} />
          <div className="vhs-tape-wrinkle" style={{ animationDelay: '2s' }} />
          <div className="vhs-tape-wrinkle" style={{ animationDelay: '4s' }} />
        </>
      )}

      {/* Heat Distortion */}
      {showBackgroundEffects && <div className="heat-distortion" />}

      {/* Edge Corruption - Creeping from sides */}
      {showEdgeCorruption && (
        <>
          <div className="edge-corruption top" />
          <div className="edge-corruption bottom" />
          <div className="edge-corruption left" />
          <div className="edge-corruption right" />
        </>
      )}

      {/* Triangle Chaos - Background geometric patterns */}
      {showTriangles && TRIANGLE_POSITIONS.map((pos, i) => (
        <div
          key={i}
          className="triangle-chaos"
          style={{
            ...pos,
            animationDelay: `${pos.delay}s`,
            position: 'absolute'
          }}
        />
      ))}

      {/* Skip button - fades in after 3 seconds in upper right */}
      {showWarning && (
        <button onClick={handleSkip} className="glitch-skip-btn-fade">
          Skip
        </button>
      )}

      {/* Subliminal Message Flash */}
      {showSubliminal && (
        <div className="subliminal-flash">
          {subliminalMessage}
        </div>
      )}

      {/* Main content */}
      <div className={`glitch-content ${phase === GlitchPhase.CORRUPTION ? 'color-channel-shift' : ''}`}>
        <blockquote className={getTextClassNames(phase)}>
          {displayText}
        </blockquote>
        {phase === GlitchPhase.INITIAL && (
          <p className="glitch-attribution">— Brené Brown</p>
        )}
      </div>

      {/* Macabre Image Flashes - Positioned at edges with EXTREME distortion */}
      {activeFlashes.map((flash) => {
        const imagePath = flashImages[flash.index]?.path;
        // Generate random transformations for each flash
        const rotation = (Math.random() - 0.5) * 30; // -15 to +15 degrees
        const skew = (Math.random() - 0.5) * 15; // -7.5 to +7.5 degrees
        const scale = 0.8 + Math.random() * 0.6; // 0.8 to 1.4x
        const translateX = (Math.random() - 0.5) * 40; // -20% to +20%
        const translateY = (Math.random() - 0.5) * 40;
        const blur = Math.random() * 3 + 0.5; // 0.5 to 3.5px
        const contrast = Math.random() * 0.8 + 1; // 1 to 1.8
        const saturate = Math.random() * 0.8 + 0.5; // 0.5 to 1.3
        const opacity = 0.3 + Math.random() * 0.3; // 0.3 to 0.6

        return (
          <div
            key={flash.index}
            className={`macabre-flash flash-zone-${flash.zone}`}
          >
            {imagePath && (
              <div className="flash-image-container">
                <Image
                  src={imagePath}
                  alt=""
                  fill
                  sizes="500px"
                  style={{
                    objectFit: 'cover',
                    opacity,
                    filter: `blur(${blur}px) contrast(${contrast}) saturate(${saturate}) hue-rotate(${(Math.random() - 0.5) * 20}deg)`,
                    transform: `rotate(${rotation}deg) skew(${skew}deg) scale(${scale}) translate(${translateX}%, ${translateY}%)`
                  }}
                  className={flash.type === 'macabre' ? 'glitch-filter-1' : flash.type === 'tech' ? 'glitch-filter-2' : 'glitch-filter-3'}
                  priority={false}
                  unoptimized
                />
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .glitch-intro-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          color: #f5f5f5;
          overflow: hidden;
        }

        .glitch-background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          animation: background-fade-in 0.5s ease-in;
        }

        @keyframes background-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .background-pulse {
          animation: pulse-subtle 3s ease-in-out infinite;
        }

        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .glitch-warning {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid #f5f5f5;
          padding: 20px 30px;
          text-align: center;
          font-family: var(--font-geist-sans), sans-serif;
          z-index: 10001;
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
        }

        .glitch-warning.fade-in {
          opacity: 1;
        }

        .glitch-warning.fade-out {
          opacity: 0;
        }

        .glitch-warning p {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #f5f5f5;
        }

        .glitch-skip-btn {
          background: transparent;
          border: 1px solid #f5f5f5;
          color: #f5f5f5;
          padding: 8px 20px;
          cursor: pointer;
          font-family: var(--font-geist-mono), monospace;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.2s;
        }

        .glitch-skip-btn:hover {
          background: #f5f5f5;
          color: #000000;
        }

        .glitch-skip-btn-subtle {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: transparent;
          border: 1px solid rgba(120, 120, 120, 0.3);
          color: rgba(180, 180, 180, 0.6);
          padding: 6px 16px;
          cursor: pointer;
          font-family: var(--font-geist-mono), monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          z-index: 10000;
          opacity: 0.5;
        }

        .glitch-skip-btn-subtle:hover {
          opacity: 1;
          border-color: rgba(180, 180, 180, 0.6);
          color: rgba(220, 220, 220, 0.9);
          background: rgba(40, 40, 40, 0.3);
        }

        .glitch-content {
          max-width: 800px;
          padding: 40px;
          text-align: center;
          position: relative;
          z-index: 100;
        }

        .glitch-quote {
          font-family: 'Crimson Text', 'Georgia', serif;
          font-size: 2.5rem;
          line-height: 1.5;
          font-weight: 400;
          margin: 0;
          color: #f5f5f5;
        }

        .glitch-attribution {
          font-family: var(--font-geist-sans), sans-serif;
          font-size: 1.2rem;
          margin-top: 20px;
          color: #cccccc;
          font-style: italic;
        }

        .flash-image-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .subliminal-flash {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 4rem;
          font-weight: bold;
          color: #f00;
          mix-blend-mode: difference;
          z-index: 10002;
          font-family: var(--font-geist-mono), monospace;
          text-transform: uppercase;
          letter-spacing: 4px;
          pointer-events: none;
          text-shadow:
            0 0 10px #f00,
            0 0 20px #f00,
            0 0 30px #f00;
        }

        @media (max-width: 768px) {
          .glitch-quote {
            font-size: 1.8rem;
          }

          .glitch-content {
            padding: 20px;
          }

          .subliminal-flash {
            font-size: 2rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .glitch-intro-container * {
            animation: none !important;
          }

          .macabre-flash,
          .subliminal-flash {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
