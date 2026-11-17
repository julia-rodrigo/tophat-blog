import type { Lang } from './types.ts';

const pad = (n: number) => String(n).padStart(2, '0');

export function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function timeHM(d: Date = new Date()): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

const locale = (lang: Lang) => (lang === 'ja' ? 'ja-JP' : 'en-GB');

export function longDate(key: string, lang: Lang): string {
  return parseKey(key).toLocaleDateString(locale(lang), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** "Tuesday, 17 November" without the year. */
export function dayTitle(key: string, lang: Lang): string {
  return parseKey(key).toLocaleDateString(locale(lang), { weekday: 'long', day: 'numeric', month: 'long' });
}

export function shortDate(key: string, lang: Lang): string {
  return parseKey(key).toLocaleDateString(locale(lang), { day: 'numeric', month: 'short' });
}

export function monthTitle(year: number, month: number, lang: Lang): string {
  return new Date(year, month, 1).toLocaleDateString(locale(lang), { month: 'long', year: 'numeric' });
}

/** "17 Nov, 07:42" from an ISO timestamp. */
export function stamp(iso: string, lang: Lang): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString(locale(lang), { day: 'numeric', month: 'short' })}, ${timeHM(d)}`;
}

export function isValidTime(t: string): boolean {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  return !!m && +m[1] < 24 && +m[2] < 60;
}

export function normaliseTime(t: string): string {
  const [h, m] = t.trim().split(':');
  return `${pad(+h)}:${pad(+m)}`;
}

/** Days in a row with at least one entry, counting back from today (or yesterday if today is empty). */
export function streak(hasEntries: (key: string) => boolean, today = dateKey()): number {
  let key = hasEntries(today) ? today : addDays(today, -1);
  let n = 0;
  while (hasEntries(key)) {
    n++;
    key = addDays(key, -1);
  }
  return n;
}
