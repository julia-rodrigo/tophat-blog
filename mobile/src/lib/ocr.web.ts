import * as ImagePicker from 'expo-image-picker';
import { getSample } from './claudeWeb';

/** Web preview: reads the screenshot's text with Claude through the page's `sample` capability. */
export async function pickScreenshotText(): Promise<string[] | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  if (res.canceled || !res.assets[0]) return null;
  const sample = await getSample();
  if (!sample) throw new Error('Reading screenshots works in the Android app. It is not available in this preview.');
  const limits = await sample.limits().catch(() => ({ images: false }));
  if (!limits.images) throw new Error('Reading screenshots is not available here. It works in the Android app.');
  const blob = await (await fetch(res.assets[0].uri)).blob();
  const out = await sample(
    'This is a screenshot from a phone, often a notes or to-do app. Write out all the text the person wrote, exactly as it appears, one item per line. Leave out app buttons, menus, tab names, the clock and status bar. Reply with only the text, nothing else.',
    { images: [blob], modelTier: 'quick' },
  );
  return splitLines(out.text);
}

export function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-•*○◯□☐✓✔]|\d+[.)])\s*/, '').trim())
    .filter((l) => l.length > 1);
}
