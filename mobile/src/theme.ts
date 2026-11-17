import { useColorScheme } from 'react-native';
import type { Mood } from './lib/types';

/* Relaxed, neutral, pale. Built on the TopHat blog palette (white / #f0f0f0 / #626262, navy dark mode). */
const light = {
  bg: '#f6f6f4',
  surface: '#ffffff',
  sunk: '#f0f0f0',
  ink: '#1c1c1c',
  muted: '#626262',
  line: '#e3e3e0',
  rec: '#d9475f',
  recSoft: '#f8dde2',
  accent: '#4a7fb8',
  accentSoft: '#e1ecf8',
  ok: '#1a8917',
  music: '#1db954',
  mood: { happy: '#fff3d6', calm: '#ddeefb', tired: '#ece6f5', proud: '#d9f7ec', sad: '#e7ecf2' } as Record<Mood, string>,
};

const dark: typeof light = {
  bg: '#0f172a',
  surface: '#1f273a',
  sunk: '#273147',
  ink: '#dddddd',
  muted: '#a6a6a6',
  line: '#2e3850',
  rec: '#ef6b80',
  recSoft: '#3a2030',
  accent: '#8fb8e8',
  accentSoft: '#22314d',
  ok: '#4cc38a',
  music: '#3ddc76',
  mood: { happy: '#3a3322', calm: '#1f2f45', tired: '#2c2742', proud: '#1b3833', sad: '#26303f' },
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Pale colours people can pick for "one colour" mood mode. */
export const SINGLE_COLOURS = ['#ddeefb', '#fff3d6', '#d9f7ec', '#ece6f5', '#f8dde2', '#f0f0f0'];
