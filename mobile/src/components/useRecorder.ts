import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { speechLocale } from '../lib/i18n';
import { keepFile } from '../lib/files';
import { useDiary } from '../lib/store';
import { fileJob } from '../lib/transcribeFile';

export type RecState = 'idle' | 'recording' | 'paused' | 'finishing';

/** Errors that just mean "quiet for a while"; recording carries on. */
const QUIET_ERRORS = new Set(['no-speech', 'speech-timeout']);

/**
 * Hands-free voice recording. Tap start once; it keeps listening (restarting itself after
 * silences) until finish() is called. Returns the transcript and the audio files.
 */
export function useRecorder() {
  const lang = useDiary((s) => s.settings.lang);
  const keepAudio = useDiary((s) => s.settings.keepAudio);
  const [state, setState] = useState<RecState>('idle');
  const [finalText, setFinalText] = useState('');
  const [partial, setPartial] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const want = useRef<RecState>('idle');
  const finalRef = useRef('');
  const partialRef = useRef('');
  const audio = useRef<string[]>([]);
  const ended = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (state !== 'recording') return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const startNative = useCallback(() => {
    const record = keepAudio && ExpoSpeechRecognitionModule.supportsRecording();
    ExpoSpeechRecognitionModule.start({
      lang: speechLocale(lang),
      interimResults: true,
      continuous: true,
      addsPunctuation: true,
      recordingOptions: record ? { persist: true } : undefined,
    });
  }, [lang, keepAudio]);

  useSpeechRecognitionEvent('result', (e) => {
    if (fileJob.running || want.current === 'idle') return;
    const text = e.results[0]?.transcript ?? '';
    if (e.isFinal) {
      finalRef.current = [finalRef.current, text.trim()].filter(Boolean).join(' ');
      partialRef.current = '';
      setFinalText(finalRef.current);
      setPartial('');
    } else {
      partialRef.current = text;
      setPartial(text);
    }
  });

  useSpeechRecognitionEvent('audioend', (e) => {
    if (fileJob.running || want.current === 'idle') return;
    if (e.uri) audio.current.push(e.uri);
  });

  useSpeechRecognitionEvent('error', (e) => {
    if (fileJob.running || want.current === 'idle') return;
    if (QUIET_ERRORS.has(e.error)) return;
    if (e.error === 'aborted') return;
    setError(e.message || e.error);
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'language-not-supported') {
      want.current = 'idle';
      setState('idle');
    }
  });

  useSpeechRecognitionEvent('end', () => {
    if (fileJob.running) return;
    // Android stops after long silences; start again so the user never has to hold anything.
    if (want.current === 'recording') {
      if (partialRef.current) {
        finalRef.current = [finalRef.current, partialRef.current.trim()].filter(Boolean).join(' ');
        partialRef.current = '';
        setFinalText(finalRef.current);
        setPartial('');
      }
      startNative();
      return;
    }
    ended.current?.();
    ended.current = null;
  });

  const start = useCallback(async () => {
    setError(null);
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError('Microphone permission is off. Turn it on in Android settings to record.');
      return;
    }
    finalRef.current = '';
    partialRef.current = '';
    audio.current = [];
    setFinalText('');
    setPartial('');
    setSeconds(0);
    want.current = 'recording';
    setState('recording');
    startNative();
  }, [startNative]);

  const pause = useCallback(() => {
    want.current = 'paused';
    setState('paused');
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const resume = useCallback(() => {
    want.current = 'recording';
    setState('recording');
    startNative();
  }, [startNative]);

  /** Stops and returns what was said. The caller saves it. */
  const finish = useCallback(async () => {
    const wasPaused = want.current === 'paused';
    want.current = 'finishing';
    setState('finishing');
    if (!wasPaused) {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 2500);
        ended.current = () => {
          clearTimeout(timer);
          resolve();
        };
        ExpoSpeechRecognitionModule.stop();
      });
    }
    const text = [finalRef.current, partialRef.current.trim()].filter(Boolean).join(' ');
    const audioUris: string[] = [];
    for (const uri of audio.current) {
      try {
        audioUris.push(await keepFile(uri, 'voice'));
      } catch {
        // The audio is a bonus; the text is what matters.
      }
    }
    const durationSec = seconds;
    want.current = 'idle';
    setState('idle');
    setFinalText('');
    setPartial('');
    return { text, audioUris, durationSec };
  }, [seconds]);

  return { canTalk: true, state, transcript: [finalText, partial].filter(Boolean).join(' '), seconds, error, start, pause, resume, finish };
}

export function fmtSeconds(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
