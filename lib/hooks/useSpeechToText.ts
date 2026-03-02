/**
 * useSpeechToText Hook
 *
 * Provides speech-to-text functionality with three providers:
 * 1. Web Speech API (free, Chrome/Edge/Safari) — default
 * 2. Wispr Flow API (auto-formatted, cleaned transcript)
 * 3. OpenAI Whisper API (paid fallback)
 *
 * Usage:
 * const { isListening, isSupported, transcript, startListening, stopListening } = useSpeechToText();
 * const wispr = useSpeechToText({ provider: 'wispr', wisprDictionary: ['Acme Corp'] });
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudioCapture } from './useAudioCapture';
import { useRecordingTimer } from './useRecordingTimer';

export type SpeechProvider = 'web-speech' | 'wispr' | 'whisper';

export interface UseSpeechToTextOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  provider?: SpeechProvider;
  wisprDictionary?: string[];
  maxDuration?: number;
  onTranscriptChange?: (transcript: string) => void;
  onError?: (error: string) => void;
  onTimerWarning?: () => void;
  onTimerFlash?: () => void;
}

export interface UseSpeechToTextReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  // Timer (available for all providers)
  formattedTime: string;
  isWarning: boolean;
  isFlashing: boolean;
  isExpired: boolean;
  // Provider info
  provider: SpeechProvider;
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextReturn {
  const {
    continuous = true,
    interimResults = true,
    language = 'en-US',
    provider = 'web-speech',
    wisprDictionary,
    maxDuration = 300_000,
    onTranscriptChange,
    onError,
    onTimerWarning,
    onTimerFlash,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  // Audio capture for wispr/whisper providers
  const audioCapture = useAudioCapture();

  // Recording timer
  const timer = useRecordingTimer({
    maxDurationMs: maxDuration,
    onTimeout: () => {
      // Auto-stop on timeout
      if (provider === 'web-speech') {
        recognitionRef.current?.stop();
      } else {
        handleApiStop();
      }
    },
    onWarning: onTimerWarning,
    onFlash: onTimerFlash,
  });

  // Check browser support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (provider === 'web-speech') {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SR);
        if (SR) recognitionRef.current = new SR();
      } else {
        // wispr/whisper always supported if mediaDevices available
        setIsSupported(!!navigator.mediaDevices?.getUserMedia);
      }
    }
  }, [provider]);

  // Configure Web Speech recognition
  useEffect(() => {
    if (provider !== 'web-speech' || !recognitionRef.current) return;

    const recognition = recognitionRef.current;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result || !result[0]) continue;
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcriptText + ' ';
        } else {
          interim += transcriptText;
        }
      }

      if (finalTranscript) {
        const newTranscript = transcriptRef.current + finalTranscript;
        setTranscript(newTranscript);
        onTranscriptChange?.(newTranscript);
      }

      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = `Speech recognition error: ${event.error}`;
      setError(errorMessage);
      onError?.(errorMessage);
      setIsListening(false);
      timer.stopTimer();
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      timer.stopTimer();
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };
  }, [provider, continuous, interimResults, language, onTranscriptChange, onError, timer]);

  // Handle API-based stop (wispr/whisper)
  const handleApiStop = useCallback(async () => {
    if (!audioCapture.isRecording) return;

    try {
      const startTime = Date.now();
      const audioBlob = await audioCapture.stopRecording();
      timer.stopTimer();
      setIsListening(false);
      setInterimTranscript('Processing...');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      if (provider === 'wispr' && wisprDictionary?.length) {
        formData.append('dictionary', JSON.stringify(wisprDictionary));
      }

      const endpoint = provider === 'wispr' ? '/api/wispr-transcribe' : '/api/speech-to-text';
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const result = await res.json();
      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const msg = result.error || 'Transcription failed';
        setError(msg);
        onError?.(msg);
        setInterimTranscript('');
        return;
      }

      const newTranscript = transcriptRef.current + (result.text || '');
      setTranscript(newTranscript);
      setInterimTranscript('');
      onTranscriptChange?.(newTranscript);

      // Log metrics (fire and forget)
      logTranscriptionMetric(provider, audioBlob.size, latencyMs, result.text || '');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transcription failed';
      setError(msg);
      onError?.(msg);
      setInterimTranscript('');
      setIsListening(false);
    }
  }, [audioCapture, provider, wisprDictionary, onTranscriptChange, onError, timer]);

  const startListening = useCallback(() => {
    setError(null);

    if (provider === 'web-speech') {
      if (!recognitionRef.current) {
        const errorMsg = 'Speech recognition not supported in this browser';
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }
      try {
        recognitionRef.current.start();
        timer.startTimer();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start speech recognition';
        if (errorMessage.includes('already started')) return;
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } else {
      // wispr or whisper — use audio capture
      audioCapture.startRecording().then(() => {
        setIsListening(true);
        timer.startTimer();
      }).catch((err) => {
        const msg = err instanceof Error ? err.message : 'Microphone access denied';
        setError(msg);
        onError?.(msg);
      });
    }
  }, [provider, audioCapture, onError, timer]);

  const stopListening = useCallback(() => {
    if (provider === 'web-speech') {
      if (!recognitionRef.current) return;
      try {
        recognitionRef.current.stop();
      } catch (err: unknown) {
        console.warn('Error stopping recognition:', err);
      }
      timer.stopTimer();
    } else {
      handleApiStop();
    }
  }, [provider, handleApiStop, timer]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    timer.resetTimer();
  }, [timer]);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    formattedTime: timer.formattedTime,
    isWarning: timer.isWarning,
    isFlashing: timer.isFlashing,
    isExpired: timer.isExpired,
    provider,
  };
}

/**
 * Fire-and-forget metrics logging
 */
function logTranscriptionMetric(
  provider: string,
  audioSize: number,
  latencyMs: number,
  text: string
) {
  const audioDurationMs = Math.round((audioSize / 32000) * 1000); // 16kHz 16-bit = 32KB/s
  const costPerMinute = provider === 'whisper' ? 0.006 : 0;
  const estimatedCost = (audioDurationMs / 60000) * costPerMinute;

  fetch('/api/transcription-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider,
      audio_duration_ms: audioDurationMs,
      transcription_latency_ms: latencyMs,
      character_count: text.length,
      original_text: text,
      estimated_cost_usd: estimatedCost,
      source: 'goodhang',
    }),
  }).catch(() => {
    // Fire and forget
  });
}
