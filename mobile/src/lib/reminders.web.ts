import type { Lang, Settings } from './types';

/** Reminders are Android notifications; the web preview just keeps the setting. */
export async function syncReminder(_reminder: Settings['reminder'], _lang: Lang): Promise<boolean> {
  return false;
}
