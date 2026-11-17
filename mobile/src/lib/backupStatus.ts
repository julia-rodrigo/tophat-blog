import { create } from 'zustand';

/** Not saved to disk: just tells the You tab when the last phone backup happened. */
export const useBackupStatus = create<{ last: Date | null; error: string | null }>(() => ({ last: null, error: null }));
