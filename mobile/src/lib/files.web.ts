import JSZip from 'jszip';
import { getDownloads } from './claudeWeb';
import { dateKey } from './dates';
import { dayToText, photoFileName } from './dayText';
import { snapshot, useDiary } from './store';
import type { DiaryData, Day, Lang } from './types';

/* Web preview versions of files.ts. Data lives in the browser; files are offered through the page's downloads. */

export async function keepFile(uri: string, _prefix: string): Promise<string> {
  return uri;
}

export async function writeAutoBackup(_data?: DiaryData): Promise<Date> {
  // The diary itself is already kept in this browser's storage.
  return new Date();
}

export function lastAutoBackup(): Date | null {
  return null;
}

async function bytesOf(uri: string): Promise<Uint8Array | null> {
  try {
    if (uri.startsWith('data:')) {
      const b64 = uri.slice(uri.indexOf(',') + 1);
      const bin = atob(b64);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }
    return new Uint8Array(await (await fetch(uri)).arrayBuffer());
  } catch {
    return null;
  }
}

async function save(filename: string, bytes: Uint8Array): Promise<string> {
  const dl = await getDownloads();
  if (!dl) throw new Error('Saving files works in the Android app. This preview cannot save files here.');
  await dl.save({ filename, data: new Blob([bytes as BlobPart], { type: 'application/zip' }) });
  return filename;
}

export async function backupNowToFolder(): Promise<string> {
  const data = snapshot();
  const zip = new JSZip();
  zip.file('diary.json', JSON.stringify({ app: 'Log Day5', version: 1, savedAt: new Date().toISOString(), data }));
  return save(`LogDay5-backup-${dateKey()}.zip`, await zip.generateAsync({ type: 'uint8array' }));
}

export function restoreFromFile(): Promise<{ days: number } | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,.json,application/zip,application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      try {
        let parsed: { data?: DiaryData };
        if (file.name.endsWith('.json')) parsed = JSON.parse(await file.text());
        else {
          const zip = await JSZip.loadAsync(await file.arrayBuffer());
          const json = await zip.file('diary.json')?.async('string');
          if (!json) throw new Error('This file is not a Log Day5 backup.');
          parsed = JSON.parse(json);
        }
        if (!parsed.data?.days) throw new Error('This file is not a Log Day5 backup.');
        useDiary.getState().replaceAll(parsed.data);
        resolve({ days: Object.keys(parsed.data.days).length });
      } catch (e) {
        reject(e);
      }
    };
    input.click();
  });
}

async function buildDayZip(day: Day, lang: Lang): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file(`${day.date}.txt`, dayToText(day, lang));
  const photos = [...day.entries].sort((a, b) => a.time.localeCompare(b.time)).filter((e) => e.kind === 'photo');
  for (let i = 0; i < photos.length; i++) {
    const bytes = photos[i].mediaUri ? await bytesOf(photos[i].mediaUri!) : null;
    if (bytes) zip.file(photoFileName(photos[i], i), bytes);
  }
  return zip.generateAsync({ type: 'uint8array' });
}

export async function saveDayToFolder(day: Day, lang: Lang): Promise<string> {
  return save(`LogDay5-${day.date}.zip`, await buildDayZip(day, lang));
}

export async function shareDay(day: Day, lang: Lang): Promise<void> {
  await saveDayToFolder(day, lang);
}
