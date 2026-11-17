import { Tabs } from 'expo-router/js-tabs';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useT } from '../../lib/i18n';
import { useTheme } from '../../theme';

const icon = (name: 'today' | 'diary' | 'todo' | 'you') =>
  function TabIcon({ color }: { color: import("react-native").ColorValue }) {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
        {name === 'today' ? (
          <>
            <Rect x={9} y={3} width={6} height={11} rx={3} />
            <Path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </>
        ) : name === 'diary' ? (
          <>
            <Rect x={3} y={5} width={18} height={16} rx={3} />
            <Path d="M3 10h18M8 3v4M16 3v4" />
          </>
        ) : name === 'todo' ? (
          <Path d="M4 7l2 2 4-4M4 16l2 2 4-4M13 7h7M13 16h7" />
        ) : (
          <>
            <Circle cx={12} cy={8} r={4} />
            <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
          </>
        )}
      </Svg>
    );
  };

export default function TabsLayout() {
  const t = useTheme();
  const s = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line },
        sceneStyle: { backgroundColor: t.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: s.today, tabBarIcon: icon('today') }} />
      <Tabs.Screen name="diary" options={{ title: s.diary, tabBarIcon: icon('diary') }} />
      <Tabs.Screen name="todo" options={{ title: s.todo, tabBarIcon: icon('todo') }} />
      <Tabs.Screen name="you" options={{ title: s.you, tabBarIcon: icon('you') }} />
    </Tabs>
  );
}
