import * as ImagePicker from 'expo-image-picker';
import { extractTextFromImage, isSupported } from 'expo-text-extractor';

/** Lets the person pick a screenshot and reads the text in it, on the phone (no internet needed). */
export async function pickScreenshotText(): Promise<string[] | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  if (res.canceled || !res.assets[0]) return null;
  if (!isSupported) throw new Error('Reading text from pictures is not supported on this phone.');
  const blocks = await extractTextFromImage(res.assets[0].uri);
  return splitLines(blocks.join('\n'));
}

/** One item per line, without empty lines or bullet marks. */
export function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-•*○◯□☐✓✔]|\d+[.)])\s*/, '').trim())
    .filter((l) => l.length > 1);
}
