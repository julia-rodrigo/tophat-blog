import { Platform } from 'react-native';
import { addDays, dateKey } from './dates';
import { useDiary } from './store';
import { newId } from './text';
import type { Day, Entry, Mood, Todo } from './types';

/**
 * Web preview only: fills an empty diary with clearly marked example entries so the
 * calendar and day pages have something to show. "Clear examples" removes them.
 */
export function seedExamplesOnWeb(): void {
  if (Platform.OS !== 'web') return;
  const run = () => {
    const s = useDiary.getState();
    if (Object.keys(s.days).length || s.todos.length) return;
    const today = dateKey();
    const e = (time: string, kind: Entry['kind'], text: string, mood: Mood, extra: Partial<Entry> = {}): Entry => ({
      id: newId(),
      kind,
      text,
      time,
      mood,
      createdAt: new Date().toISOString(),
      ...extra,
    });
    const day = (offset: number, name: string, entries: Entry[]): Day => ({ date: addDays(today, -offset), name, nameByUser: false, entries });
    const edited = e('07:42', 'voice', 'Woke up to rain. Coffee first, then I want to finally sketch the app idea I had last night.', 'calm', {
      originalText: 'Woke up to rain. Coffee first, then sketch the app idea.',
      originalTime: '07:42',
      updatedAt: new Date().toISOString(),
    });
    const days: Day[] = [
      day(0, 'Woke up to rain', [
        edited,
        e('08:15', 'music', 'Sunday Best · Surfaces', 'happy', { link: 'https://open.spotify.com/search/Sunday%20Best%20Surfaces' }),
        e('09:03', 'todo', 'Book dentist appointment for next week', 'calm'),
        e('12:30', 'idea', 'What if the diary made a little trailer of your week? Short clips of your voice with music.', 'happy'),
      ]),
      day(1, 'Farmers market with Lina', [
        e('10:10', 'voice', 'Farmers market with Lina, bought way too many tomatoes. Such a fun morning.', 'happy'),
        e('18:40', 'voice', 'Quiet dinner, early night.', 'calm'),
      ]),
      day(2, 'Tired but proud', [e('21:05', 'voice', 'Tired but proud, finished the report two days early.', 'proud')]),
      day(4, 'Gym before work', [e('06:50', 'voice', 'Gym before work. Legs are already complaining, so tired.', 'tired')]),
    ];
    const todos: Todo[] = [
      { id: newId(), text: 'Book dentist appointment for next week', done: false, createdAt: new Date().toISOString(), source: 'voice' },
      { id: newId(), text: 'Buy printer ink', done: false, createdAt: new Date(Date.now() - 864e5).toISOString(), source: 'drive' },
      { id: newId(), text: 'Call mum back', done: true, createdAt: new Date(Date.now() - 2 * 864e5).toISOString(), source: 'voice' },
    ];
    useDiary.setState({
      days: Object.fromEntries(days.map((d) => [d.date, d])),
      todos,
      settings: { ...s.settings, exampleData: true },
    });
  };
  if (useDiary.persist.hasHydrated()) run();
  else useDiary.persist.onFinishHydration(run);
}

export function clearExamples(): void {
  const s = useDiary.getState();
  useDiary.setState({ days: {}, todos: [], settings: { ...s.settings, exampleData: false } });
}
