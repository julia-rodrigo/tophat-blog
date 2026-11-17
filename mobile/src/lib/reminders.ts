import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Lang, Settings } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const CHANNEL = 'diary-reminder';

/** Cancels any old reminder and, if switched on, schedules the daily one. */
export async function syncReminder(reminder: Settings['reminder'], lang: Lang): Promise<boolean> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!reminder.on) return true;
  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Diary reminder',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Log Day5',
      body: lang === 'ja' ? '今日はどんな日でしたか？タップして話しましょう。' : 'How was your day? Tap to talk it through.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminder.hour,
      minute: reminder.minute,
      channelId: CHANNEL,
    },
  });
  return true;
}
