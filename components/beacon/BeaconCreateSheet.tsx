'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { useBeacons, useReverseGeocode } from '@/lib/hooks/useBeacons';
import type { BeaconDurationHint } from '@/lib/types/database';

interface BeaconCreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'location' | 'venue' | 'enrich' | 'success';

const DURATION_OPTIONS: { value: BeaconDurationHint; label: string }[] = [
  { value: 'quick_drink', label: 'Quick drink' },
  { value: 'few_hours', label: 'A few hours' },
  { value: 'all_night', label: 'All night' },
];

/**
 * Bottom sheet for creating a beacon
 * Flow: Get location -> Confirm venue -> Optional enrichment -> Success
 */
export function BeaconCreateSheet({
  isOpen,
  onClose,
  onSuccess,
}: BeaconCreateSheetProps) {
  const [step, setStep] = useState<Step>('location');
  const [venueName, setVenueName] = useState<string | null>(null);
  const [venueAddress, setVenueAddress] = useState<string>('');
  const [vibeText, setVibeText] = useState('');
  const [durationHint, setDurationHint] = useState<BeaconDurationHint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { coords, loading: geoLoading, error: geoError, permissionDenied, requestLocation } = useGeolocation();
  const { reverseGeocode } = useReverseGeocode();
  const { createBeacon } = useBeacons();

  // Reset state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setStep('location');
      setVenueName(null);
      setVenueAddress('');
      setVibeText('');
      setDurationHint(null);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Auto-request location when sheet opens
  useEffect(() => {
    if (isOpen && step === 'location' && !coords && !geoLoading) {
      handleRequestLocation();
    }
  }, [isOpen, step, coords, geoLoading]);

  const handleRequestLocation = async () => {
    setError(null);
    const result = await requestLocation();

    if (result) {
      // Got location, now reverse geocode
      const geocodeResult = await reverseGeocode(result.latitude, result.longitude);

      if (geocodeResult) {
        setVenueName(geocodeResult.venue_name);
        setVenueAddress(geocodeResult.address);
      }

      setStep('venue');
    }
  };

  const handleConfirmVenue = () => {
    setStep('enrich');
  };

  const handleSkipEnrichment = () => {
    handleSubmit();
  };

  const handleSubmit = useCallback(async () => {
    if (!coords) {
      setError('Location not available');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const beacon = await createBeacon({
      lat: coords.latitude,
      lng: coords.longitude,
      venue_name: venueName || undefined,
      venue_address: venueAddress || undefined,
      vibe_text: vibeText || undefined,
      duration_hint: durationHint || undefined,
    });

    setIsSubmitting(false);

    if (beacon) {
      setStep('success');
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 100]);
      }
      // Auto-close after success
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setError('Failed to create beacon. Please try again.');
    }
  }, [coords, venueName, venueAddress, vibeText, durationHint, createBeacon, onSuccess]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background-lighter border-t-2 border-neon-cyan/30 rounded-t-2xl max-h-[80vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-foreground-dim/30 rounded-full" />
        </div>

        <div className="px-6 pb-8">
          {/* Step: Location */}
          {step === 'location' && (
            <div className="text-center py-8">
              {geoLoading ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                  <h2 className="text-xl font-mono font-bold text-neon-cyan mb-2">
                    Getting your location...
                  </h2>
                  <p className="text-foreground-dim font-mono text-sm">
                    This should only take a moment
                  </p>
                </>
              ) : permissionDenied ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 text-neon-magenta text-5xl">
                    📍
                  </div>
                  <h2 className="text-xl font-mono font-bold text-neon-magenta mb-2">
                    Location Access Needed
                  </h2>
                  <p className="text-foreground-dim font-mono text-sm mb-6">
                    Enable location access to broadcast where you&apos;re hanging out.
                  </p>
                  <button
                    onClick={handleRequestLocation}
                    className="px-6 py-3 bg-neon-cyan text-background font-mono font-bold rounded hover:shadow-[0_0_20px_rgba(0,204,221,0.4)] transition-all"
                  >
                    Try Again
                  </button>
                </>
              ) : geoError ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 text-neon-magenta text-5xl">
                    ⚠️
                  </div>
                  <h2 className="text-xl font-mono font-bold text-neon-magenta mb-2">
                    Location Error
                  </h2>
                  <p className="text-foreground-dim font-mono text-sm mb-6">
                    {geoError}
                  </p>
                  <button
                    onClick={handleRequestLocation}
                    className="px-6 py-3 bg-neon-cyan text-background font-mono font-bold rounded hover:shadow-[0_0_20px_rgba(0,204,221,0.4)] transition-all"
                  >
                    Try Again
                  </button>
                </>
              ) : null}
            </div>
          )}

          {/* Step: Venue Confirmation */}
          {step === 'venue' && (
            <div className="py-4">
              <h2 className="text-xl font-mono font-bold text-neon-cyan mb-6 text-center">
                Confirm Your Location
              </h2>

              <div className="bg-background border-2 border-neon-cyan/30 rounded-lg p-4 mb-6">
                {venueName ? (
                  <>
                    <div className="text-lg font-mono font-bold text-foreground mb-1">
                      {venueName}
                    </div>
                    <div className="text-foreground-dim font-mono text-sm">
                      📍 {venueAddress}
                    </div>
                  </>
                ) : (
                  <div className="text-foreground-dim font-mono">
                    📍 {venueAddress || 'Location detected'}
                  </div>
                )}
              </div>

              <button
                onClick={handleConfirmVenue}
                className="w-full py-4 bg-neon-cyan text-background font-mono font-bold text-lg rounded hover:shadow-[0_0_20px_rgba(0,204,221,0.4)] transition-all mb-3"
              >
                This is right
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 border-2 border-foreground-dim/30 text-foreground-dim font-mono rounded hover:border-foreground-dim transition-all"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Step: Enrichment (Optional) */}
          {step === 'enrich' && (
            <div className="py-4">
              <h2 className="text-xl font-mono font-bold text-neon-cyan mb-2 text-center">
                Add Some Details
              </h2>
              <p className="text-foreground-dim font-mono text-sm text-center mb-6">
                Optional - you can skip this
              </p>

              {/* Vibe text */}
              <div className="mb-4">
                <label className="block text-foreground-dim font-mono text-sm mb-2">
                  What&apos;s the vibe?
                </label>
                <input
                  type="text"
                  value={vibeText}
                  onChange={(e) => setVibeText(e.target.value.slice(0, 140))}
                  placeholder="Grabbing drinks, working remotely..."
                  className="w-full px-4 py-3 bg-background border-2 border-neon-cyan/30 text-foreground font-mono rounded focus:border-neon-cyan focus:outline-none transition-all"
                  maxLength={140}
                />
                <div className="text-right text-foreground-dim font-mono text-xs mt-1">
                  {vibeText.length}/140
                </div>
              </div>

              {/* Duration hint */}
              <div className="mb-6">
                <label className="block text-foreground-dim font-mono text-sm mb-2">
                  How long are you staying?
                </label>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDurationHint(durationHint === option.value ? null : option.value)}
                      className={`flex-1 py-2 px-3 font-mono text-sm rounded border-2 transition-all ${
                        durationHint === option.value
                          ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
                          : 'border-foreground-dim/30 text-foreground-dim hover:border-foreground-dim'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-neon-magenta/20 border border-neon-magenta rounded text-neon-magenta font-mono text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 bg-neon-cyan text-background font-mono font-bold text-lg rounded hover:shadow-[0_0_20px_rgba(0,204,221,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {isSubmitting ? 'Broadcasting...' : "I'm Here!"}
              </button>

              <button
                onClick={handleSkipEnrichment}
                disabled={isSubmitting}
                className="w-full py-3 border-2 border-foreground-dim/30 text-foreground-dim font-mono rounded hover:border-foreground-dim transition-all disabled:opacity-50"
              >
                Skip & Broadcast
              </button>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-neon-cyan/20 border-2 border-neon-cyan rounded-full flex items-center justify-center text-4xl">
                📍
              </div>
              <h2 className="text-2xl font-mono font-bold text-neon-cyan mb-2">
                You&apos;re Live!
              </h2>
              <p className="text-foreground-dim font-mono">
                Friends can now find you
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
