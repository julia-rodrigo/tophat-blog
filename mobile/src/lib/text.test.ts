import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diffWords, guessMood, parseSpoken, suggestDayName } from './text.ts';
import { dayToText } from './dayText.ts';
import { streak, addDays } from './dates.ts';

test('voice to-do commands become to-dos', () => {
  assert.deepEqual(parseSpoken('Add to my to-do: send Marco the photos'), { kind: 'todo', text: 'Send Marco the photos' });
  assert.deepEqual(parseSpoken('add this to my todo list buy printer ink.'), { kind: 'todo', text: 'Buy printer ink' });
  assert.deepEqual(parseSpoken('remind me to call mum'), { kind: 'todo', text: 'Call mum' });
  assert.deepEqual(parseSpoken('牛乳を買うをやることに追加'), { kind: 'todo', text: '牛乳を買う' });
  assert.deepEqual(parseSpoken('やること：母に電話する'), { kind: 'todo', text: '母に電話する' });
});

test('ideas and normal notes', () => {
  assert.deepEqual(parseSpoken('Idea: a weekly voice postcard'), { kind: 'idea', text: 'A weekly voice postcard' });
  assert.equal(parseSpoken('went to the market today').kind, 'voice');
  assert.equal(parseSpoken('I have so much to do today').kind, 'voice');
});

test('mood guess', () => {
  assert.equal(guessMood('Tired but it was a long day'), 'tired');
  assert.equal(guessMood('Lunch was amazing, I loved it'), 'happy');
  assert.equal(guessMood('Bus to work'), 'calm');
  assert.equal(guessMood('今日は最高に楽しい'), 'happy');
});

test('day name from first words', () => {
  assert.equal(suggestDayName(['So, woke up to rain. Coffee first.']), 'Woke up to rain');
  assert.equal(suggestDayName(['um today went to the farmers market with Lina and bought tomatoes']), 'Went to the farmers market…');
  assert.equal(suggestDayName(['', '']), '');
  assert.equal(suggestDayName(['駅前の新しいカフェに行った。']), '駅前の新しいカフェに行った');
});

test('word diff marks removed and added words', () => {
  const parts = diffWords('Coffee first, then sketch', 'Coffee first, then finally sketch the idea');
  assert.deepEqual(parts.filter((p) => p.type !== 'same').map((p) => [p.type, p.text.trim()]), [
    ['added', 'finally'],
    ['added', 'the idea'],
  ]);
  const removed = diffWords('buy milk and eggs', 'buy eggs');
  assert.ok(removed.some((p) => p.type === 'removed' && p.text.includes('milk')));
});

test('streak counts back from today', () => {
  const today = '2026-11-17';
  const set = new Set([today, addDays(today, -1), addDays(today, -2), addDays(today, -4)]);
  assert.equal(streak((k) => set.has(k), today), 3);
  set.delete(today);
  assert.equal(streak((k) => set.has(k), today), 2);
});

test('day text lists entries in time order with photo file names', () => {
  const txt = dayToText(
    {
      date: '2026-11-17',
      name: 'Rainy start',
      nameByUser: false,
      entries: [
        { id: 'b', kind: 'photo', text: 'Bus window', time: '08:20', createdAt: '', mediaUri: 'file:///x/photo-1.jpg' },
        { id: 'a', kind: 'voice', text: 'Woke up to rain.', time: '07:42', createdAt: '', updatedAt: 'x' },
        { id: 'c', kind: 'music', text: 'Sunday Best', time: '08:15', createdAt: '', link: 'https://open.spotify.com/track/1' },
      ],
    },
    'en',
  );
  const lines = txt.split('\n');
  assert.equal(lines[0], 'Rainy start');
  assert.ok(txt.indexOf('07:42') < txt.indexOf('08:15') && txt.indexOf('08:15') < txt.indexOf('08:20'));
  assert.ok(txt.includes('07:42  Woke up to rain.  (edited)'));
  assert.ok(txt.includes('[photo: photos/0820-1.jpg] Bus window'));
  assert.ok(txt.includes('Song: Sunday Best (https://open.spotify.com/track/1)'));
});
