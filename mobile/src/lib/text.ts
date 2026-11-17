import type { Mood } from './types.ts';

/* ---------- Voice commands ---------- */

const TODO_PREFIXES = [
  /^\s*(?:please\s+)?(?:add|put)\s+(?:this\s+|that\s+)?(?:to|on|in)(?:to)?\s+(?:my\s+|the\s+)?to[\s-]?do(?:\s+list)?\s*[:,.-]?\s*/i,
  /^\s*to[\s-]?do\s*[:,.-]\s*/i,
  /^\s*remind me to\s+/i,
  /^\s*(?:やること|ToDo|TODO|トゥードゥー)(?:に追加)?\s*[:：、,]?\s*/,
];
const TODO_SUFFIXES = [/\s*(?:を)?(?:やること|ToDo|TODO)に(?:追加|入れて)(?:して)?(?:ください)?[。.]?\s*$/];
const IDEA_PREFIXES = [/^\s*(?:new\s+)?idea\s*[:,.-]?\s+/i, /^\s*アイデア\s*[:：、,]?\s*/];

export type Parsed = { kind: 'voice' | 'todo' | 'idea'; text: string };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Turns "add to my to-do: buy milk" into a to-do, "idea: …" into an idea. */
export function parseSpoken(raw: string): Parsed {
  const text = raw.trim();
  for (const re of TODO_PREFIXES) {
    if (re.test(text)) {
      const rest = text.replace(re, '').trim();
      if (rest) return { kind: 'todo', text: cap(rest.replace(/[.。]$/, '')) };
    }
  }
  for (const re of TODO_SUFFIXES) {
    if (re.test(text)) {
      const rest = text.replace(re, '').trim();
      if (rest) return { kind: 'todo', text: rest };
    }
  }
  for (const re of IDEA_PREFIXES) {
    if (re.test(text)) {
      const rest = text.replace(re, '').trim();
      if (rest) return { kind: 'idea', text: cap(rest) };
    }
  }
  return { kind: 'voice', text: cap(text) };
}

/* ---------- Mood (simple on-phone guess; the user can switch colours off) ---------- */

const MOOD_WORDS: Record<Exclude<Mood, 'calm'>, RegExp> = {
  happy: /\b(happy|great|amazing|love|loved|fun|awesome|excited|yay|lovely|perfect|best|laugh(?:ed)?|ten out of ten)\b|嬉しい|楽しい|最高|幸せ|好き|わくわく/i,
  proud: /\b(proud|finished|did it|achieved|won|managed|nailed|done early|promotion)\b|やった|達成|頑張った|できた/i,
  tired: /\b(tired|exhausted|sleepy|long day|drained|worn out|no energy)\b|疲れ|眠い|だるい/i,
  sad: /\b(sad|upset|lonely|cried|cry|miss(?:ed)?|worried|anxious|stressed|angry)\b|悲しい|寂しい|不安|つらい|辛い|怒/i,
};

export function guessMood(text: string): Mood {
  let best: Mood = 'calm';
  let bestCount = 0;
  for (const [mood, re] of Object.entries(MOOD_WORDS) as [Mood, RegExp][]) {
    const count = (text.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')) || []).length;
    if (count > bestCount) {
      best = mood;
      bestCount = count;
    }
  }
  return best;
}

/* ---------- Day name ---------- */

const FILLER = /^(?:so|um+|uh+|well|okay|ok|and|then|today|just|like|えっと|あの|今日は)[\s,、]+/i;

/**
 * Names a day from what was said. Uses the first clause of the first spoken
 * entry. The AI name (signed-in users) replaces this later; the user can always rename.
 */
export function suggestDayName(texts: string[]): string {
  const first = texts.map((t) => t.trim()).find((t) => t.length > 0);
  if (!first) return '';
  let cleaned = first;
  for (let i = 0; i < 3; i++) cleaned = cleaned.replace(FILLER, '');
  const clause = cleaned.split(/[.!?。！？\n]|,\s|、/)[0].trim();
  if (/[぀-ヿ一-龯]/.test(clause)) {
    return clause.length > 16 ? clause.slice(0, 16) + '…' : clause;
  }
  const words = clause.split(/\s+/).filter(Boolean);
  const name = words.slice(0, 5).join(' ');
  return cap(name) + (words.length > 5 ? '…' : '');
}

/* ---------- Word diff for edited entries ---------- */

export type DiffPart = { type: 'same' | 'added' | 'removed'; text: string };

function tokens(s: string): string[] {
  // Japanese has no spaces, so compare character by character there.
  if (/[぀-ヿ一-龯]/.test(s)) return Array.from(s);
  return s.split(/(\s+)/).filter((t) => t.length > 0);
}

export function diffWords(before: string, after: string): DiffPart[] {
  const a = tokens(before);
  const b = tokens(after);
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
  const out: DiffPart[] = [];
  const push = (type: DiffPart['type'], text: string) => {
    const last = out[out.length - 1];
    if (last && last.type === type) last.text += text;
    else out.push({ type, text });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push('same', a[i]);
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) push('removed', a[i++]);
    else push('added', b[j++]);
  }
  while (i < n) push('removed', a[i++]);
  while (j < m) push('added', b[j++]);
  return out;
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
