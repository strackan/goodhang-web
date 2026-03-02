/**
 * useAudioCapture — MediaRecorder + WAV conversion for Wispr/Whisper
 *
 * Captures audio from the microphone and returns a 16kHz 16-bit PCM WAV blob.
 */

import { useState, useRef, useCallback } from 'react';

export interface UseAudioCaptureReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob>;
  error: string | null;
}

export function useAudioCapture(): UseAudioCaptureReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const resolveStopRef = useRef<((blob: Blob) => void) | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const wavBlob = await convertToWav(webmBlob);
        resolveStopRef.current?.(wavBlob);
        resolveStopRef.current = null;
      };

      mediaRecorder.start(250); // collect chunks every 250ms
      setIsRecording(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(msg);
      throw err;
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        reject(new Error('Not recording'));
        return;
      }

      resolveStopRef.current = resolve;
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    });
  }, []);

  return { isRecording, startRecording, stopRecording, error };
}

/**
 * Convert a webm blob to 16kHz 16-bit mono PCM WAV using AudioContext.
 */
async function convertToWav(webmBlob: Blob): Promise<Blob> {
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: 16000 });

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0); // mono

    // Resample if needed
    const targetSampleRate = 16000;
    let samples: Float32Array;
    if (audioBuffer.sampleRate !== targetSampleRate) {
      const ratio = audioBuffer.sampleRate / targetSampleRate;
      const newLength = Math.round(channelData.length / ratio);
      samples = new Float32Array(newLength);
      for (let i = 0; i < newLength; i++) {
        samples[i] = channelData[Math.round(i * ratio)] ?? 0;
      }
    } else {
      samples = channelData;
    }

    // Encode as 16-bit PCM WAV
    const numSamples = samples.length;
    const dataSize = numSamples * 2;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');

    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);         // chunk size
    view.setUint16(20, 1, true);          // PCM
    view.setUint16(22, 1, true);          // mono
    view.setUint32(24, targetSampleRate, true);
    view.setUint32(28, targetSampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true);          // block align
    view.setUint16(34, 16, true);         // bits per sample

    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    for (let i = 0; i < numSamples; i++) {
      const clamped = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(44 + i * 2, clamped * 0x7fff, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  } finally {
    await audioCtx.close();
  }
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
