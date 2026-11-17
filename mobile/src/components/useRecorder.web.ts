import { useCallback, useEffect, useRef, useState } from 'react';
import { getDictation, type Dictation } from '../lib/claudeWeb';
import { speechLocale } from '../lib/i18n';
import { useDiary } from '../lib/store';
import type { RecState } from './useRecorder';

export { fmtSeconds } from './useRecorder';

let dict: Dictation | null | undefined;
const ready = getDictation().then((d) => {
  dict = d;
  return d;
});

/**
 * Web version of the recorder, used in the claude.ai preview. It talks to the page's dictation.
 * If dictation isn't available, canTalk is false and the panel offers typing instead.
 */
export function useRecorder() {
  const lang = useDiary((s) => s.settings.lang);
  const [canTalk, setCanTalk] = useState<boolean>(dict !== null);
  const [state, setState] = useState<RecState>('idle');
  const [finalText, setFinalText] = useState('');
  const [partial, setPartial] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const want = useRef<RecState>('idle');
  const finalRef = useRef('');
  const partialRef = useRef('');

  useEffect(() => {
    let offs: (() => void)[] = [];
    ready.then((d) => {
      setCanTalk(!!d);
      if (!d) return;
      offs = [
        d.onPartial(({ text }) => {
          partialRef.current = text;
          setPartial(text);
        }),
        d.onFinal(({ text }) => {
          finalRef.current = [finalRef.current, text.trim()].filter(Boolean).join(' ');
          partialRef.current = '';
          setFinalText(finalRef.current);
          setPartial('');
        }),
        d.onState(({ state: st, reason }) => {
          // The page was hidden or hit a time limit: keep what was said, wait for Resume.
          if (st === 'idle' && want.current === 'recording' && reason && reason !== 'stopped') {
            want.current = 'paused';
            setState('paused');
          }
        }),
      ];
    });
    return () => offs.forEach((f) => f());
  }, []);

  useEffect(() => {
    if (state !== 'recording') return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const begin = useCallback(() => {
    if (!dict) {
      setCanTalk(false);
      return;
    }
    // Must be called straight from the tap, with nothing awaited first.
    dict.start({ language: speechLocale(lang) }).catch((e: { code?: string; message?: string }) => {
      want.current = 'idle';
      setState('idle');
      if (e?.code === 'not_granted' || e?.code === 'unavailable') setCanTalk(false);
      setError(e?.code === 'dismissed' ? 'Microphone was not allowed. Tap again to try.' : e?.message || 'Dictation is not available here.');
    });
    want.current = 'recording';
    setState('recording');
  }, [lang]);

  const start = useCallback(async () => {
    setError(null);
    finalRef.current = '';
    partialRef.current = '';
    setFinalText('');
    setPartial('');
    setSeconds(0);
    begin();
  }, [begin]);

  const pause = useCallback(() => {
    want.current = 'paused';
    setState('paused');
    dict?.stop().catch(() => {});
  }, []);

  const resume = useCallback(() => {
    setError(null);
    begin();
  }, [begin]);

  const finish = useCallback(async () => {
    const wasPaused = want.current === 'paused';
    want.current = 'finishing';
    setState('finishing');
    if (!wasPaused && dict?.active()) await dict.stop().catch(() => {});
    const text = [finalRef.current, partialRef.current.trim()].filter(Boolean).join(' ');
    want.current = 'idle';
    setState('idle');
    setFinalText('');
    setPartial('');
    return { text, audioUris: [] as string[], durationSec: seconds };
  }, [seconds]);

  return { canTalk, state, transcript: [finalText, partial].filter(Boolean).join(' '), seconds, error, start, pause, resume, finish };
}
