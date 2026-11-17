import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GearIcon } from '../../components/icons';
import { computeStats } from '../../lib/stats';
import { useDiary } from '../../lib/store';
import { FadeIn, GrowBar } from '../../components/motion';
import { HAND, useTheme } from '../../theme';

const TOD = {
  en: { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' },
  ja: { morning: '朝', afternoon: '昼', evening: '夕方', night: '夜' },
};
const DAYS = { en: ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'], ja: ['月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜'] };
const MOOD = {
  en: { happy: 'happy', calm: 'calm', tired: 'tired', proud: 'proud', sad: 'low' },
  ja: { happy: '楽しい', calm: '穏やか', tired: '疲れ', proud: '誇らしい', sad: '落ち込み' },
};

/** Fun numbers about your diary. */
export default function StatsScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const days = useDiary((s) => s.days);
  const moodOn = useDiary((s) => s.settings.moodMode !== 'off');
  const lang = useDiary((s) => s.settings.lang);
  const ja = lang === 'ja';
  const st = useMemo(() => computeStats(days), [days]);
  const maxBar = Math.max(1, ...st.last14.map((d) => d.count));
  const maxTod = Math.max(1, ...st.timeOfDay.map((d) => d.count));
  const topTod = [...st.timeOfDay].sort((a, b) => b.count - a.count)[0];
  const moodTotal = st.moods.reduce((n, m) => n + m.count, 0);

  const Big = ({ n, label, colour }: { n: number | string; label: string; colour: string }) => (
    <View style={[styles.tile, { backgroundColor: colour }]}>
      <Text style={{ fontFamily: HAND, fontSize: 40, lineHeight: 44, color: t.ink }}>{n}</Text>
      <Text style={{ color: t.ink, opacity: 0.7, fontSize: 12 }}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 14, paddingBottom: 30, gap: 14 }}>
      <View style={styles.head}>
        <Text style={{ fontFamily: HAND, fontSize: 36, color: t.ink }}>{ja ? 'きろく' : 'Stats'}</Text>
        <Pressable onPress={() => router.push('/settings')} hitSlop={10} accessibilityLabel="Settings" accessibilityRole="button">
          <GearIcon color={t.muted} />
        </Pressable>
      </View>

      <FadeIn>
      <View style={styles.tiles}>
        <Big n={st.streak} label={ja ? '日連続 🔥' : 'day streak 🔥'} colour={t.mood.happy} />
        <Big n={st.pages} label={ja ? 'ページ' : 'pages'} colour={t.mood.calm} />
        <Big n={st.notes} label={ja ? 'メモ' : 'notes'} colour={t.mood.proud} />
        <Big n={st.words} label={ja ? '語' : 'words'} colour={t.mood.tired} />
      </View>
      </FadeIn>

      <View style={[styles.card, { backgroundColor: t.paper, borderColor: t.line }]}>
        <Text style={[styles.h, { color: t.ink }]}>{ja ? '最近14日' : 'Last 14 days'}</Text>
        <View style={styles.bars}>
          {st.last14.map((d, i) => (
            <View key={d.date} style={styles.barCol}>
              <View style={{ height: 74, width: '100%', justifyContent: 'flex-end' }}>
                <GrowBar vertical size={d.count ? 0.06 + (d.count / maxBar) * 0.94 : 0.05} delay={i * 35} color={d.count ? (i === 13 ? t.rec : t.accent) : t.line} style={styles.bar} />
              </View>
              <Text style={{ fontSize: 9, color: t.muted }}>{Number(d.date.slice(8))}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: t.muted, fontSize: 12 }}>
          {ja ? `最長の連続記録：${st.longest}日` : `Longest streak: ${st.longest} ${st.longest === 1 ? 'day' : 'days'}`}
        </Text>
      </View>

      {st.notes ? (
        <View style={[styles.card, { backgroundColor: t.paper, borderColor: t.line }]}>
          <Text style={[styles.h, { color: t.ink }]}>{ja ? 'よく書く時間' : 'When you write'}</Text>
          {st.timeOfDay.map((d) => (
            <View key={d.label} style={styles.hRow}>
              <Text style={{ width: 82, color: t.ink, fontSize: 13 }}>{TOD[lang][d.label]}</Text>
              <View style={[styles.hTrack, { backgroundColor: t.sunk }]}>
                <GrowBar size={d.count / maxTod} color={d.label === topTod.label ? t.rec : t.accent} style={{ height: '100%', borderRadius: 4 }} />
              </View>
              <Text style={{ width: 26, textAlign: 'right', color: t.muted, fontSize: 12, fontVariant: ['tabular-nums'] }}>{d.count}</Text>
            </View>
          ))}
          <Text style={{ color: t.ink, fontFamily: HAND, fontSize: 22 }}>
            {ja
              ? `${TOD.ja[topTod.label]}型${st.busiestWeekday !== null ? `・${DAYS.ja[st.busiestWeekday]}によく書く` : ''}`
              : `You're a ${TOD.en[topTod.label].toLowerCase()} writer${st.busiestWeekday !== null ? `, busiest on ${DAYS.en[st.busiestWeekday]}` : ''}.`}
          </Text>
        </View>
      ) : null}

      {moodOn && moodTotal ? (
        <View style={[styles.card, { backgroundColor: t.paper, borderColor: t.line }]}>
          <Text style={[styles.h, { color: t.ink }]}>{ja ? '気分' : 'Your moods'}</Text>
          <View style={styles.moodBar}>
            {st.moods.map((m) => (
              <View key={m.mood} style={{ flex: m.count, backgroundColor: t.mood[m.mood] }} />
            ))}
          </View>
          <View style={styles.wrap}>
            {st.moods.map((m) => (
              <View key={m.mood} style={styles.legend}>
                <View style={[styles.swatch, { backgroundColor: t.mood[m.mood], borderColor: t.line }]} />
                <Text style={{ color: t.ink, fontSize: 13 }}>
                  {MOOD[lang][m.mood]} {Math.round((m.count / moodTotal) * 100)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {st.topWords.length ? (
        <View style={[styles.card, { backgroundColor: t.paper, borderColor: t.line }]}>
          <Text style={[styles.h, { color: t.ink }]}>{ja ? 'よく使う言葉' : 'Words you use most'}</Text>
          <View style={styles.wrap}>
            {st.topWords.map((w, i) => (
              <Text key={w.word} style={[styles.word, { color: t.ink, fontSize: 20 - Math.min(i, 6), fontFamily: HAND, backgroundColor: Object.values(t.mood)[i % 5] }]}>
                {w.word} <Text style={{ fontSize: 12, color: t.muted }}>{w.count}</Text>
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: t.accentSoft, borderColor: t.accentSoft }]}>
        <Text style={[styles.h, { color: t.ink }]}>{ja ? 'あなたはどんな人？' : 'What kind of person are you?'}</Text>
        <Text style={{ color: t.muted, fontSize: 13 }}>
          {ja ? 'AIがあなたの日記から性格タイプを見つけます。AIプランで近日公開。' : 'AI reads your diary and finds your personality type. Coming with the AI plan.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexGrow: 1, flexBasis: '45%', borderRadius: 4, padding: 14, transform: [{ rotate: '-0.6deg' }] },
  card: { borderRadius: 6, borderWidth: 1, padding: 14, gap: 10 },
  h: { fontSize: 15, fontWeight: '700' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 92 },
  barCol: { flex: 1, alignItems: 'center', gap: 3 },
  bar: { width: '100%', borderRadius: 3 },
  hRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hTrack: { flex: 1, height: 10, borderRadius: 4, overflow: 'hidden' },
  moodBar: { flexDirection: 'row', height: 18, borderRadius: 4, overflow: 'hidden' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 14, height: 14, borderRadius: 3, borderWidth: 1 },
  word: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 3, overflow: 'hidden' },
});
