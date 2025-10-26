'use client';

import { useState, useEffect } from 'react';
import { GlitchIntroV2 } from './GlitchIntroV2';
import { HomePage } from './HomePage';

export function GlitchWrapper() {
  const [showIntro, setShowIntro] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleRewatchIntro = () => {
    // Clear the localStorage flag
    if (typeof window !== 'undefined') {
      localStorage.removeItem('goodhang_seen_glitch');
      sessionStorage.removeItem('goodhang_session');
    }
    // Show intro again
    setShowIntro(true);
  };

  // Show loading state until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {showIntro && <GlitchIntroV2 onComplete={handleIntroComplete} />}
      {!showIntro && <HomePage onRewatchIntro={handleRewatchIntro} />}
    </>
  );
}
