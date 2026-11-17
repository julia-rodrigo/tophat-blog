import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats } from './stats.ts';
import type { Day, Entry } from './types.ts';

const e = (time: string, text: string, kind: Entry['kind'] = 'voice', mood: Entry['mood'] = 'calm'): Entry => ({ id: time + text, kind, text, time, createdAt: '', mood });
const d = (date: string, entries: Entry[]): Day => ({ date, name: '', nameByUser: false, entries });

test('stats count pages, notes, words, streaks and patterns', () => {
  const days = {
    '2026-11-17': d('2026-11-17', [e('07:40', 'Coffee and rain, coffee again', 'voice', 'happy'), e('08:00', '', 'photo')]),
    '2026-11-16': d('2026-11-16', [e('21:10', 'Coffee with Lina', 'note', 'happy')]),
    '2026-11-15': d('2026-11-15', [e('20:00', 'Long shift', 'voice', 'tired')]),
    '2026-11-10': d('2026-11-10', [e('09:00', 'Gym', 'voice')]),
    '2026-11-09': d('2026-11-09', []),
  };
  const s = computeStats(days, '2026-11-17');
  assert.equal(s.pages, 4);
  assert.equal(s.notes, 5);
  assert.equal(s.photos, 1);
  assert.equal(s.streak, 3);
  assert.equal(s.longest, 3);
  assert.equal(s.words, 5 + 3 + 2 + 1);
  assert.deepEqual(s.topWords[0], { word: 'coffee', count: 3 });
  assert.equal(s.moods[0].mood, 'happy');
  assert.equal(s.last14.length, 14);
  assert.equal(s.last14[13].count, 2);
  const tod = Object.fromEntries(s.timeOfDay.map((x) => [x.label, x.count]));
  assert.deepEqual(tod, { morning: 3, afternoon: 0, evening: 2, night: 0 });
});
