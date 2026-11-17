import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { writeAutoBackup } from '../lib/files';
import { syncReminder } from '../lib/reminders';
import { useDiary } from '../lib/store';
import { useBackupStatus } from '../lib/backupStatus';
import { useTheme } from '../theme';

/** Saves a phone backup a couple of seconds after anything changes. */
function useAutoBackup() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsub = useDiary.subscribe((state, prev) => {
      if (state.days === prev.days && state.todos === prev.todos && state.settings === prev.settings) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        writeAutoBackup()
          .then((d) => useBackupStatus.setState({ last: d, error: null }))
          .catch((e) => useBackupStatus.setState({ error: String(e?.message ?? e) }));
      }, 2000);
    });
    return () => {
      unsub();
      if (timer) clearTimeout(timer);
    };
  }, []);
}

function useReminderSync() {
  const reminder = useDiary((s) => s.settings.reminder);
  const lang = useDiary((s) => s.settings.lang);
  useEffect(() => {
    syncReminder(reminder, lang).catch(() => {});
  }, [reminder, lang]);
}

export default function RootLayout() {
  const t = useTheme();
  useAutoBackup();
  useReminderSync();
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="day/[date]" />
        <Stack.Screen name="drive" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        <Stack.Screen name="plans" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
