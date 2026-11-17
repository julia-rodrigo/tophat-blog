import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Muted } from '../../components/ui';
import { dateKey, monthTitle, shortDate, streak } from '../../lib/dates';
import { useT } from '../../lib/i18n';
import { useDiary } from '../../lib/store';
import { HAND, useTheme } from '../../theme';

const DOW = { en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], ja: ['月', '火', '水', '木', '金', '土', '日'] };

export default function CalendarScreen() {
  const t = useTheme();
  const s = useT();
  const insets = useSafeAreaInsets();
  const days = useDiary((st) => st.days);
  const lang = useDiary((st) => st.settings.lang);
  const moodMode = useDiary((st) => st.settings.moodMode);
  const single = useDiary((st) => st.settings.singleColor);
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const today = dateKey();

  const has = (k: string) => (days[k]?.entries.length ?? 0) > 0;
  const run = streak(has, today);

  const cells = useMemo(() => {
    const lead = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7;
    const n = new Date(ym.y, ym.m + 1, 0).getDate();
    const out: (string | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= n; d++) out.push(dateKey(new Date(ym.y, ym.m, d)));
    while (out.length % 7) out.push(null);
    return out;
  }, [ym]);

  const prefix = `${ym.y}-${String(ym.m + 1).padStart(2, '0')}`;
  const list = Object.values(days)
    .filter((d) => d.entries.length && d.date.startsWith(prefix))
    .sort((a, b) => b.date.localeCompare(a.date));

  const shift = (n: number) => setYm(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }));
  const tint = (k: string) => {
    if (moodMode === 'off') return t.sunk;
    if (moodMode === 'single') return single;
    const first = [...(days[k]?.entries ?? [])].sort((a, b) => a.time.localeCompare(b.time))[0];
    return t.mood[first?.mood ?? 'calm'];
  };

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, gap: 16 }}>
      <View style={styles.head}>
        <Pressable onPress={() => shift(-1)} hitSlop={10} accessibilityLabel="Previous month">
          <Text style={{ fontSize: 22, color: t.muted }}>‹</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontFamily: HAND, fontSize: 34, color: t.ink }}>{monthTitle(ym.y, ym.m, lang)}</Text>
        </View>
        <Pressable onPress={() => shift(1)} hitSlop={10} accessibilityLabel="Next month">
          <Text style={{ fontSize: 22, color: t.muted }}>›</Text>
        </Pressable>
      </View>
      <Text style={{ textAlign: 'center', color: run ? t.rec : t.muted, fontWeight: '600' }}>
        {run ? `🔥 ${run} ${s.streak}` : lang === 'ja' ? '今日書いて連続記録をスタート' : 'Write today to start a streak'}
      </Text>

      <View style={styles.grid}>
        {DOW[lang].map((d, i) => (
          <Text key={`d${i}`} style={[styles.cell, styles.dow, { color: t.muted }]}>
            {d}
          </Text>
        ))}
        {cells.map((k, i) =>
          k ? (
            <Pressable
              key={k}
              onPress={() => router.push(`/day/${k}`)}
              style={[
                styles.cell,
                styles.day,
                { backgroundColor: has(k) ? tint(k) : t.sunk, borderColor: k === today ? t.accent : 'transparent' },
              ]}
            >
              <Text style={{ color: t.ink, fontWeight: k === today ? '700' : '400' }}>{Number(k.slice(8))}</Text>
              {has(k) ? <View style={[styles.dot, { backgroundColor: t.rec }]} /> : null}
            </Pressable>
          ) : (
            <View key={`e${i}`} style={styles.cell} />
          ),
        )}
      </View>

      <View style={{ gap: 8 }}>
        {list.length === 0 ? <Muted style={{ textAlign: 'center' }}>{lang === 'ja' ? 'この月はまだページがありません。' : 'No pages this month yet.'}</Muted> : null}
        {list.map((d) => (
          <Pressable
            key={d.date}
            onPress={() => router.push(`/day/${d.date}`)}
            style={[styles.row, { backgroundColor: t.paper, borderColor: t.line }]}
          >
            <Text style={{ flex: 1, color: t.ink, fontFamily: HAND, fontSize: 22 }} numberOfLines={1}>
              {d.name || (lang === 'ja' ? '無題の日' : 'Untitled day')}
            </Text>
            <Text style={{ color: t.muted, fontSize: 12, fontVariant: ['tabular-nums'] }}>
              {shortDate(d.date, lang)} · {d.entries.length}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
  dow: { textAlign: 'center', fontSize: 11, aspectRatio: undefined, paddingVertical: 4 },
  day: { borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 3, margin: 0 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, borderWidth: 1 },
});
