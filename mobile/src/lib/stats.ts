import { addDays, dateKey, parseKey, streak } from './dates.ts';
import type { Day, Mood } from './types.ts';

const STOP = new Set(
  (
    'the a an and or but so to of in on at for with my me i im i\'m it its it\'s is was were be been am are this that then just really very have had has ' +
    'do did not no yes you your we our they them he she his her there here what when where how all some more so too up out about like get got go went ' +
    'going today day one can will would could should from by as if into than also back after before over again still now'
  ).split(/\s+/),
);

export type Stats = {
  pages: number;
  notes: number;
  words: number;
  voiceNotes: number;
  photos: number;
  streak: number;
  longest: number;
  timeOfDay: { label: 'morning' | 'afternoon' | 'evening' | 'night'; count: number }[];
  busiestWeekday: number | null; // 0 = Monday
  moods: { mood: Mood; count: number }[];
  topWords: { word: string; count: number }[];
  last14: { date: string; count: number }[];
};

export function computeStats(days: Record<string, Day>, today = dateKey()): Stats {
  const list = Object.values(days).filter((d) => d.entries.length);
  const entries = list.flatMap((d) => d.entries.map((e) => ({ ...e, date: d.date })));
  const has = (k: string) => (days[k]?.entries.length ?? 0) > 0;

  // Longest run of consecutive days.
  const keys = list.map((d) => d.date).sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of keys) {
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = k;
  }

  const tod = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const weekday = new Array(7).fill(0);
  const moods: Record<string, number> = {};
  const words: Record<string, number> = {};
  let wordCount = 0;
  for (const e of entries) {
    const h = Number(e.time.slice(0, 2));
    tod[h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'afternoon' : h >= 17 && h < 22 ? 'evening' : 'night']++;
    weekday[(parseKey(e.date).getDay() + 6) % 7]++;
    if (e.mood) moods[e.mood] = (moods[e.mood] ?? 0) + 1;
    if (e.text && !['sound', 'music', 'photo', 'video'].includes(e.kind)) {
      const ws = e.text.toLowerCase().match(/[\p{L}']+/gu) ?? [];
      wordCount += ws.length;
      for (const w of ws) if (w.length > 2 && !STOP.has(w)) words[w] = (words[w] ?? 0) + 1;
    }
  }

  const maxDay = Math.max(...weekday);
  return {
    pages: list.length,
    notes: entries.length,
    words: wordCount,
    voiceNotes: entries.filter((e) => e.kind === 'voice' || e.audioUris?.length).length,
    photos: entries.filter((e) => e.kind === 'photo').length,
    streak: streak(has, today),
    longest,
    timeOfDay: (Object.entries(tod) as [Stats['timeOfDay'][number]['label'], number][]).map(([label, count]) => ({ label, count })),
    busiestWeekday: maxDay > 0 ? weekday.indexOf(maxDay) : null,
    moods: (Object.entries(moods) as [Mood, number][]).map(([mood, count]) => ({ mood, count })).sort((a, b) => b.count - a.count),
    topWords: Object.entries(words)
      .filter(([, c]) => c > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({ word, count })),
    last14: Array.from({ length: 14 }, (_, i) => {
      const k = addDays(today, i - 13);
      return { date: k, count: days[k]?.entries.length ?? 0 };
    }),
  };
}
