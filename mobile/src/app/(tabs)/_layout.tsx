import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';
import { CalendarIcon, CheckIcon, PagesIcon, PencilIcon, StatsIcon } from '../../components/icons';
import { useDiary } from '../../lib/store';
import { useTheme } from '../../theme';

const tab = (Icon: typeof PencilIcon) =>
  function TabIcon({ color }: { color: ColorValue }) {
    return <Icon color={color} size={24} />;
  };

/** Five tabs: Write, Calendar, Pages, To-do, Stats. */
export default function TabsLayout() {
  const t = useTheme();
  const ja = useDiary((s) => s.settings.lang === 'ja');
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.rec,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.bg, borderTopColor: t.line },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: t.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: ja ? '書く' : 'Write', tabBarIcon: tab(PencilIcon) }} />
      <Tabs.Screen name="calendar" options={{ title: ja ? 'カレンダー' : 'Calendar', tabBarIcon: tab(CalendarIcon) }} />
      <Tabs.Screen name="pages" options={{ title: ja ? 'ページ' : 'Pages', tabBarIcon: tab(PagesIcon) }} />
      <Tabs.Screen name="todo" options={{ title: ja ? 'やること' : 'To-do', tabBarIcon: tab(CheckIcon) }} />
      <Tabs.Screen name="stats" options={{ title: ja ? 'きろく' : 'Stats', tabBarIcon: tab(StatsIcon) }} />
    </Tabs>
  );
}
