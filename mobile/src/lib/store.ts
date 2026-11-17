import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { dateKey, normaliseTime, timeHM } from './dates';
import { guessMood, newId, parseSpoken, suggestDayName } from './text';
import type { DiaryData, Day, Entry, Settings, Todo } from './types';

export const DEFAULT_SETTINGS: Settings = {
  lang: 'en',
  moodMode: 'auto',
  singleColor: '#ddeefb',
  keepAudio: true,
  reminder: { on: true, hour: 21, minute: 0 },
};

type NewEntry = Omit<Entry, 'id' | 'createdAt' | 'time'> & { time?: string };

interface DiaryState extends DiaryData {
  /** Saves a spoken recording. Detects "add to my to-do…" and "idea:". */
  addSpoken: (input: { text: string; audioUris?: string[]; durationSec?: number; source?: 'voice' | 'drive' }) => Entry | null;
  addEntry: (entry: NewEntry, date?: string) => Entry;
  updateEntry: (date: string, id: string, change: { text?: string; time?: string }) => void;
  deleteEntry: (date: string, id: string) => void;
  renameDay: (date: string, name: string) => void;
  addTodo: (text: string, source?: Todo['source']) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setSettings: (change: Partial<Settings>) => void;
  replaceAll: (data: DiaryData) => void;
}

function withAutoName(day: Day): Day {
  if (day.nameByUser) return day;
  const spoken = [...day.entries]
    .sort((a, b) => a.time.localeCompare(b.time))
    .filter((e) => e.kind === 'voice' || e.kind === 'idea')
    .map((e) => e.text);
  const fallback = [...day.entries].sort((a, b) => a.time.localeCompare(b.time)).map((e) => e.text);
  return { ...day, name: suggestDayName(spoken.length ? spoken : fallback) };
}

function emptyDay(date: string): Day {
  return { date, name: '', nameByUser: false, entries: [] };
}

export const useDiary = create<DiaryState>()(
  persist(
    (set, get) => ({
      days: {},
      todos: [],
      settings: DEFAULT_SETTINGS,

      addSpoken: ({ text, audioUris, durationSec, source = 'voice' }) => {
        const trimmed = text.trim();
        if (!trimmed && !audioUris?.length) return null;
        const parsed = trimmed ? parseSpoken(trimmed) : { kind: 'voice' as const, text: '' };
        if (parsed.kind === 'todo') get().addTodo(parsed.text, source);
        return get().addEntry({
          kind: parsed.kind,
          text: parsed.text,
          audioUris,
          durationSec,
          mood: parsed.text ? guessMood(parsed.text) : 'calm',
        });
      },

      addEntry: (input, date = dateKey()) => {
        const now = new Date();
        const entry: Entry = {
          ...input,
          id: newId(),
          time: input.time ?? timeHM(now),
          createdAt: now.toISOString(),
          mood: input.mood ?? (input.text ? guessMood(input.text) : 'calm'),
        };
        set((s) => {
          const day = s.days[date] ?? emptyDay(date);
          return { days: { ...s.days, [date]: withAutoName({ ...day, entries: [...day.entries, entry] }) } };
        });
        return entry;
      },

      updateEntry: (date, id, change) =>
        set((s) => {
          const day = s.days[date];
          if (!day) return s;
          const entries = day.entries.map((e) => {
            if (e.id !== id) return e;
            const text = change.text?.trim() ?? e.text;
            const time = change.time ? normaliseTime(change.time) : e.time;
            if (text === e.text && time === e.time) return e;
            return {
              ...e,
              text,
              time,
              originalText: e.originalText ?? e.text,
              originalTime: e.originalTime ?? e.time,
              updatedAt: new Date().toISOString(),
              mood: text !== e.text ? guessMood(text) : e.mood,
            };
          });
          return { days: { ...s.days, [date]: withAutoName({ ...day, entries }) } };
        }),

      deleteEntry: (date, id) =>
        set((s) => {
          const day = s.days[date];
          if (!day) return s;
          return {
            days: { ...s.days, [date]: withAutoName({ ...day, entries: day.entries.filter((e) => e.id !== id) }) },
          };
        }),

      renameDay: (date, name) =>
        set((s) => {
          const day = s.days[date] ?? emptyDay(date);
          const trimmed = name.trim();
          // Clearing the name hands it back to auto-naming.
          if (!trimmed) return { days: { ...s.days, [date]: withAutoName({ ...day, nameByUser: false }) } };
          return { days: { ...s.days, [date]: { ...day, name, nameByUser: true } } };
        }),

      addTodo: (text, source = 'typed') =>
        set((s) => ({
          todos: [{ id: newId(), text: text.trim(), done: false, createdAt: new Date().toISOString(), source }, ...s.todos],
        })),
      toggleTodo: (id) => set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      deleteTodo: (id) => set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),

      setSettings: (change) => set((s) => ({ settings: { ...s.settings, ...change } })),

      replaceAll: (data) =>
        set({ days: data.days ?? {}, todos: data.todos ?? [], settings: { ...DEFAULT_SETTINGS, ...data.settings } }),
    }),
    {
      name: 'logday5-diary',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ days: s.days, todos: s.todos, settings: s.settings }),
    },
  ),
);

export function snapshot(): DiaryData {
  const { days, todos, settings } = useDiary.getState();
  return { days, todos, settings };
}
