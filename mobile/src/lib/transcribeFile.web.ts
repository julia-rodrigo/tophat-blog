import type { Lang } from './types';

export const fileJob = { running: false };

export async function pickAndTranscribeAudio(_lang: Lang): Promise<string | null> {
  throw new Error('Turning an audio file into text works in the Android app.');
}
