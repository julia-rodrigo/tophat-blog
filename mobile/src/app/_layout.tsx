import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { Caveat_700Bold, useFonts } from '@expo-google-fonts/caveat';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { writeAutoBackup } from '../lib/files';
import { syncReminder } from '../lib/reminders';
import { useDiary } from '../lib/store';
import { useBackupStatus } from '../lib/backupStatus';
import { useIsDark, useTheme } from '../theme';
import { DialogHost } from '../components/DialogHost';
import { seedExamplesOnWeb } from '../lib/demo';

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
  const isDark = useIsDark();
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.background = t.bg;
      document.body.style.background = t.bg;
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    }
  }, [t.bg, isDark]);
  // Android loads the handwriting font from the app; the web page loads it from Google Fonts.
  const [fontsReady] = useFonts(Platform.OS === 'web' ? {} : { Caveat_700Bold });
  useAutoBackup();
  useReminderSync();
  useEffect(() => seedExamplesOnWeb(), []);
  if (!fontsReady) return null;
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="day/[date]" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="plans" options={{ presentation: 'modal' }} />
      </Stack>
      <DialogHost />
    </>
  );
}
