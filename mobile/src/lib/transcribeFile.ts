import * as DocumentPicker from 'expo-document-picker';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { speechLocale } from './i18n';
import type { Lang } from './types';

/** Busy flag so the live recorder ignores events that belong to a file being transcribed. */
export const fileJob = { running: false };

/**
 * Picks an audio file and turns it into text with the phone's speech recognition.
 * Android 13+. Works best with 16 kHz WAV, MP3 or OGG recordings.
 */
export async function pickAndTranscribeAudio(lang: Lang): Promise<string | null> {
  const picked = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
  if (picked.canceled || !picked.assets?.[0]) return null;
  const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  if (!perm.granted) throw new Error('Speech recognition permission is off.');

  fileJob.running = true;
  const parts: string[] = [];
  try {
    await new Promise<void>((resolve, reject) => {
      const subs = [
        ExpoSpeechRecognitionModule.addListener('result', (e) => {
          if (e.isFinal && e.results[0]?.transcript) parts.push(e.results[0].transcript.trim());
        }),
        ExpoSpeechRecognitionModule.addListener('error', (e) => {
          cleanup();
          reject(new Error(e.error === 'audio-capture' ? 'This phone or file format is not supported. Try a WAV or MP3 file on Android 13 or newer.' : e.message || e.error));
        }),
        ExpoSpeechRecognitionModule.addListener('end', () => {
          cleanup();
          resolve();
        }),
      ];
      const cleanup = () => subs.forEach((s) => s.remove());
      ExpoSpeechRecognitionModule.start({
        lang: speechLocale(lang),
        interimResults: false,
        continuous: true,
        addsPunctuation: true,
        audioSource: { uri: picked.assets[0].uri },
      });
    });
  } finally {
    fileJob.running = false;
  }
  return parts.join(' ').trim();
}
