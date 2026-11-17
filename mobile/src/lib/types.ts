export type Lang = 'en' | 'ja';
export type Mood = 'happy' | 'calm' | 'tired' | 'proud' | 'sad';
export type MoodMode = 'auto' | 'single' | 'off';

export type EntryKind =
  | 'voice' // spoken, turned into text
  | 'idea'
  | 'todo' // a voice note that was also added to the to-do list
  | 'photo'
  | 'video'
  | 'sound' // "sound around me" recording, no transcript
  | 'music'; // a song link (Spotify)

export interface Entry {
  id: string;
  kind: EntryKind;
  text: string;
  /** Shown time, "HH:mm". The user can change it. */
  time: string;
  /** When the entry was first saved. Never changes. */
  createdAt: string;
  /** Set the first time the words or time are edited. */
  updatedAt?: string;
  /** The text as it was first recorded, kept so edits can be compared. */
  originalText?: string;
  originalTime?: string;
  mood?: Mood;
  /** Local file for photos, videos and sound clips. */
  mediaUri?: string;
  /** Audio files of a voice note (one per recording segment). */
  audioUris?: string[];
  /** Song link for music entries. */
  link?: string;
  durationSec?: number;
}

export interface Day {
  /** "YYYY-MM-DD" */
  date: string;
  name: string;
  /** true once the user renames the day; then it is never auto-named again. */
  nameByUser: boolean;
  entries: Entry[];
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  source: 'voice' | 'drive' | 'typed';
}

export interface Settings {
  lang: Lang;
  moodMode: MoodMode;
  singleColor: string;
  keepAudio: boolean;
  reminder: { on: boolean; hour: number; minute: number };
  /** true while the web preview shows example entries */
  exampleData?: boolean;
}

export interface DiaryData {
  days: Record<string, Day>;
  todos: Todo[];
  settings: Settings;
}
