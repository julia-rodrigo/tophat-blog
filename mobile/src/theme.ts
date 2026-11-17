import { Platform, useColorScheme } from 'react-native';
import type { Mood } from './lib/types';

/* Notepad: ruled paper, a red margin line, pen-blue ink, sticky-note colours for pages. */
const light = {
  bg: '#f3f2ee',
  paper: '#fdfcf8',
  surface: '#ffffff',
  sunk: '#efeee9',
  ink: '#1f2430',
  muted: '#6b6f7a',
  line: '#e2e0d8',
  rule: '#dbe6f2',
  margin: '#f0b9c0',
  rec: '#e0485f',
  recSoft: '#fbe0e4',
  accent: '#3d6fb6',
  accentSoft: '#e2ecf8',
  ok: '#2f9a5b',
  music: '#1db954',
  mood: { happy: '#fff1c2', calm: '#dceefe', tired: '#ebe4f7', proud: '#d7f5e8', sad: '#e6ebf2' } as Record<Mood, string>,
};

const dark: typeof light = {
  bg: '#0d1424',
  paper: '#141c2f',
  surface: '#1b2439',
  sunk: '#222c44',
  ink: '#e6e6e6',
  muted: '#a3a8b4',
  line: '#2b3550',
  rule: '#22304a',
  margin: '#5a2c38',
  rec: '#f0677c',
  recSoft: '#3b2030',
  accent: '#8fb5ec',
  accentSoft: '#21314f',
  ok: '#56c98a',
  music: '#3ddc76',
  mood: { happy: '#3b3420', calm: '#1d3047', tired: '#2c2744', proud: '#193a30', sad: '#262f3f' },
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Handwritten face for titles and dates. Loaded with expo-font on Android, from Google Fonts on the web. */
export const HAND = Platform.OS === 'web' ? 'Caveat, cursive' : 'Caveat_700Bold';

/** Line height of the ruled paper. Text sits on these lines. */
export const RULE = 30;

/** Pale colours people can pick for "one colour" mood mode. */
export const SINGLE_COLOURS = ['#dceefe', '#fff1c2', '#d7f5e8', '#ebe4f7', '#fbe0e4', '#efeee9'];
