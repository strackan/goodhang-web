/**
 * useRecordingTimer — countdown timer for recording sessions
 *
 * Provides a 5-minute (configurable) countdown with warning and flash thresholds.
 */

import { useState, useRef, useCallback } from 'react';

export interface UseRecordingTimerOptions {
  maxDurationMs?: number;     // default 300_000 (5 min)
  warningAtMs?: number;       // default 60_000 (1 min remaining)
  flashAtMs?: number;         // default 10_000 (10s remaining)
  onTimeout?: (() => void) | undefined;
  onWarning?: (() => void) | undefined;
  onFlash?: (() => void) | undefined;
}

export interface UseRecordingTimerReturn {
  remainingMs: number;
  isWarning: boolean;
  isFlashing: boolean;
  isExpired: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  formattedTime: string;
}

export function useRecordingTimer(options: UseRecordingTimerOptions = {}): UseRecordingTimerReturn {
  const {
    maxDurationMs = 300_000,
    warningAtMs = 60_000,
    flashAtMs = 10_000,
    onTimeout,
    onWarning,
    onFlash,
  } = options;

  const [remainingMs, setRemainingMs] = useState(maxDurationMs);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningFiredRef = useRef(false);
  const flashFiredRef = useRef(false);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    warningFiredRef.current = false;
    flashFiredRef.current = false;
    setRemainingMs(maxDurationMs);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, maxDurationMs - elapsed);
      setRemainingMs(remaining);

      if (remaining <= warningAtMs && !warningFiredRef.current) {
        warningFiredRef.current = true;
        onWarning?.();
      }

      if (remaining <= flashAtMs && !flashFiredRef.current) {
        flashFiredRef.current = true;
        onFlash?.();
      }

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        onTimeout?.();
      }
    }, 100);
  }, [maxDurationMs, warningAtMs, flashAtMs, onTimeout, onWarning, onFlash, stopTimer]);

  const resetTimer = useCallback(() => {
    stopTimer();
    warningFiredRef.current = false;
    flashFiredRef.current = false;
    setRemainingMs(maxDurationMs);
  }, [maxDurationMs, stopTimer]);

  const isWarning = remainingMs <= warningAtMs && remainingMs > 0;
  const isFlashing = remainingMs <= flashAtMs && remainingMs > 0;
  const isExpired = remainingMs <= 0;

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    remainingMs,
    isWarning,
    isFlashing,
    isExpired,
    startTimer,
    stopTimer,
    resetTimer,
    formattedTime,
  };
}
