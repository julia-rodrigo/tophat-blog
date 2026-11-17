import { longDate } from './dates.ts';
import type { Day, Entry, Lang } from './types.ts';

const ext = (uri: string, fallback: string) => {
  const m = /\.([a-z0-9]{2,5})(?:\?|$)/i.exec(uri);
  return (m ? m[1] : fallback).toLowerCase();
};

/** File name used for a photo inside the downloaded .zip. */
export function photoFileName(e: Entry, index: number): string {
  return `photos/${e.time.replace(':', '')}-${index + 1}.${ext(e.mediaUri ?? '', 'jpg')}`;
}

/** The plain-text version of a day page, used for the .txt inside the download. */
export function dayToText(day: Day, lang: Lang): string {
  const entries = [...day.entries].sort((a, b) => a.time.localeCompare(b.time));
  const lines: string[] = [day.name || 'Untitled day', longDate(day.date, lang), '-'.repeat(32), ''];
  let photo = 0;
  for (const e of entries) {
    let line = `${e.time}  `;
    switch (e.kind) {
      case 'todo':
        line += `[ ] To-do: ${e.text}`;
        break;
      case 'idea':
        line += `Idea: ${e.text}`;
        break;
      case 'photo':
        line += `[photo: ${photoFileName(e, photo++)}]${e.text ? ' ' + e.text : ''}`;
        break;
      case 'video':
        line += `[video, not included]${e.text ? ' ' + e.text : ''}`;
        break;
      case 'sound':
        line += `[sound clip, not included]${e.text ? ' ' + e.text : ''}`;
        break;
      case 'music':
        line += `Song: ${e.text}${e.link ? ` (${e.link})` : ''}`;
        break;
      default:
        line += e.text;
    }
    if (e.updatedAt) line += '  (edited)';
    lines.push(line);
  }
  lines.push('', 'Made with Log Day5');
  return lines.join('\n');
}
