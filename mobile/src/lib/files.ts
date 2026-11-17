import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';
import { dateKey } from './dates';
import { photoFileName, dayToText } from './dayText';
import { snapshot, useDiary } from './store';
import type { DiaryData, Day, Lang } from './types';

/* ---------- Media: copy picked or recorded files into the app's own folder so they last ---------- */

function mediaDir(): Directory {
  const dir = new Directory(Paths.document, 'media');
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

export async function keepFile(uri: string, prefix: string): Promise<string> {
  const src = new File(uri);
  const ext = src.extension || '';
  const dest = new File(mediaDir(), `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}${ext}`);
  await src.copy(dest);
  return dest.uri;
}

/* ---------- Automatic phone backup ---------- */

const KEEP_DAILY = 7;

function backupDir(): Directory {
  const dir = new Directory(Paths.document, 'backups');
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/**
 * Writes the whole diary to the phone: one "latest" file plus one file per day for the last week.
 * These live in the app's documents folder, which Android's own backup also copies to the user's Google account.
 */
export async function writeAutoBackup(data: DiaryData = snapshot()): Promise<Date> {
  const json = JSON.stringify({ app: 'Log Day5', version: 1, savedAt: new Date().toISOString(), data });
  const dir = backupDir();
  const latest = new File(dir, 'latest.json');
  await latest.write(json);
  const daily = new File(dir, `backup-${dateKey()}.json`);
  await daily.write(json);
  const old = dir
    .list()
    .filter((f): f is File => f instanceof File && /^backup-\d{4}-\d{2}-\d{2}\.json$/.test(f.name))
    .sort((a, b) => b.name.localeCompare(a.name))
    .slice(KEEP_DAILY);
  old.forEach((f) => f.delete());
  return new Date();
}

export function lastAutoBackup(): Date | null {
  const f = new File(backupDir(), 'latest.json');
  if (!f.exists) return null;
  const t = f.info().modificationTime;
  return t ? new Date(t) : null;
}

/* ---------- Manual backup: one .zip with the diary and all media ---------- */

async function buildBackupZip(): Promise<Uint8Array> {
  const data = snapshot();
  const zip = new JSZip();
  const media = zip.folder('media')!;
  const copy: DiaryData = JSON.parse(JSON.stringify(data));
  for (const day of Object.values(copy.days)) {
    for (const e of day.entries) {
      const uris = [e.mediaUri, ...(e.audioUris ?? [])].filter((u): u is string => !!u);
      for (const uri of uris) {
        const f = new File(uri);
        if (!f.exists) continue;
        media.file(f.name, await f.bytes());
      }
      // Store names only; they are mapped back to real paths on restore.
      if (e.mediaUri) e.mediaUri = 'media/' + new File(e.mediaUri).name;
      if (e.audioUris) e.audioUris = e.audioUris.map((u) => 'media/' + new File(u).name);
    }
  }
  zip.file('diary.json', JSON.stringify({ app: 'Log Day5', version: 1, savedAt: new Date().toISOString(), data: copy }));
  return zip.generateAsync({ type: 'uint8array' });
}

/** Asks for a folder (e.g. Downloads or a USB/SD card) and saves the backup there. Returns the file name. */
export async function backupNowToFolder(): Promise<string> {
  const bytes = await buildBackupZip();
  const dir = await Directory.pickDirectoryAsync();
  const name = `LogDay5-backup-${dateKey()}.zip`;
  const file = dir.createFile(name, 'application/zip');
  await file.write(bytes);
  return name;
}

export async function restoreFromFile(): Promise<{ days: number } | null> {
  const picked = await File.pickFileAsync({ mimeTypes: ['application/zip', 'application/json'] });
  if (picked.canceled) return null;
  const file = picked.result;
  let parsed: { data?: DiaryData };
  if (file.name.endsWith('.json')) {
    parsed = JSON.parse(await file.text());
  } else {
    const zip = await JSZip.loadAsync(await file.bytes());
    const json = await zip.file('diary.json')?.async('string');
    if (!json) throw new Error('This file is not a Log Day5 backup.');
    parsed = JSON.parse(json);
    const dir = mediaDir();
    const map: Record<string, string> = {};
    const entries = Object.values(zip.files).filter((f) => f.name.startsWith('media/') && !f.dir);
    for (const z of entries) {
      const dest = new File(dir, z.name.slice('media/'.length));
      await dest.write(await z.async('uint8array'));
      map[z.name] = dest.uri;
    }
    for (const day of Object.values(parsed.data?.days ?? {})) {
      for (const e of day.entries) {
        if (e.mediaUri && map[e.mediaUri]) e.mediaUri = map[e.mediaUri];
        if (e.audioUris) e.audioUris = e.audioUris.map((u) => map[u] ?? u);
      }
    }
  }
  if (!parsed.data?.days) throw new Error('This file is not a Log Day5 backup.');
  useDiary.getState().replaceAll(parsed.data);
  await writeAutoBackup(parsed.data);
  return { days: Object.keys(parsed.data.days).length };
}

/* ---------- Download a day: .zip with the text and the photos ---------- */

async function buildDayZip(day: Day, lang: Lang): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file(`${day.date}.txt`, dayToText(day, lang));
  const photos = [...day.entries].sort((a, b) => a.time.localeCompare(b.time)).filter((e) => e.kind === 'photo');
  for (let i = 0; i < photos.length; i++) {
    const uri = photos[i].mediaUri;
    if (!uri) continue;
    const f = new File(uri);
    if (f.exists) zip.file(photoFileName(photos[i], i), await f.bytes());
  }
  return zip.generateAsync({ type: 'uint8array' });
}

export async function saveDayToFolder(day: Day, lang: Lang): Promise<string> {
  const bytes = await buildDayZip(day, lang);
  const dir = await Directory.pickDirectoryAsync();
  const name = `LogDay5-${day.date}.zip`;
  await dir.createFile(name, 'application/zip').write(bytes);
  return name;
}

export async function shareDay(day: Day, lang: Lang): Promise<void> {
  const bytes = await buildDayZip(day, lang);
  const file = new File(Paths.cache, `LogDay5-${day.date}.zip`);
  if (file.exists) file.delete();
  await file.write(bytes);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/zip', dialogTitle: 'Share this day' });
}
