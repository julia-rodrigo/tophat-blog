import { Pressable, Text, View } from 'react-native';
import { clearExamples } from '../lib/demo';
import { useDiary } from '../lib/store';
import { useTheme } from '../theme';

/** Web preview only: says the starting entries are examples and offers to remove them. */
export function ExampleBanner() {
  const t = useTheme();
  const on = useDiary((s) => !!s.settings.exampleData);
  const ja = useDiary((s) => s.settings.lang === 'ja');
  if (!on) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.accentSoft, borderRadius: 12, padding: 12 }}>
      <Text style={{ flex: 1, color: t.ink, fontSize: 13 }}>
        {ja ? 'これは例の記録です。自分の一日を話してみてください。' : 'These are example entries. Record your own day, or clear them.'}
      </Text>
      <Pressable onPress={clearExamples} accessibilityRole="button" hitSlop={6}>
        <Text style={{ color: t.accent, fontWeight: '700', fontSize: 13 }}>{ja ? '消去' : 'Clear examples'}</Text>
      </Pressable>
    </View>
  );
}
