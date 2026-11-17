import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shortDate } from '../../lib/dates';
import { useDiary } from '../../lib/store';
import type { Day } from '../../lib/types';
import { FadeIn } from '../../components/motion';
import { HAND, useTheme } from '../../theme';

const TILTS = ['-1.2deg', '0.8deg', '-0.5deg', '1.1deg', '0deg', '-0.9deg'];

/** All your diary pages as little notes, newest first. */
export default function PagesScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const days = useDiary((s) => s.days);
  const lang = useDiary((s) => s.settings.lang);
  const moodMode = useDiary((s) => s.settings.moodMode);
  const single = useDiary((s) => s.settings.singleColor);
  const [q, setQ] = useState('');
  const ja = lang === 'ja';

  const query = q.trim().toLowerCase();
  const list = Object.values(days)
    .filter((d) => d.entries.length)
    .filter((d) => !query || d.name.toLowerCase().includes(query) || d.entries.some((e) => e.text.toLowerCase().includes(query)))
    .sort((a, b) => b.date.localeCompare(a.date));

  const colour = (d: Day) => {
    if (moodMode === 'off') return t.paper;
    if (moodMode === 'single') return single;
    const counts: Record<string, number> = {};
    d.entries.forEach((e) => (counts[e.mood ?? 'calm'] = (counts[e.mood ?? 'calm'] ?? 0) + 1));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'calm';
    return t.mood[top as keyof typeof t.mood];
  };

  const card = (d: Day, i: number) => {
    const sorted = [...d.entries].sort((a, b) => a.time.localeCompare(b.time));
    const photo = sorted.find((e) => e.kind === 'photo' && e.mediaUri)?.mediaUri;
    const preview = sorted.filter((e) => e.text && e.kind !== 'sound').map((e) => e.text).join(' · ');
    const tape = [t.mood.happy, t.mood.calm, t.mood.proud, t.mood.tired, t.recSoft][i % 5];
    return (
      <FadeIn key={d.date} delay={Math.min(i, 10) * 60}>
      <Pressable
        onPress={() => router.push(`/day/${d.date}`)}
        style={({ pressed }) => [styles.card, { backgroundColor: colour(d), transform: [{ rotate: TILTS[i % TILTS.length] }, { scale: pressed ? 0.97 : 1 }] }]}
        accessibilityRole="button"
        accessibilityLabel={`${d.name || 'Untitled'}, ${shortDate(d.date, lang)}`}
      >
        <View style={[styles.tape, { backgroundColor: tape }]} />
        <Text style={{ color: t.muted, fontSize: 11 }}>{shortDate(d.date, lang)}</Text>
        <Text style={{ color: t.ink, fontFamily: HAND, fontSize: 24, lineHeight: 26 }} numberOfLines={2}>
          {d.name || (ja ? '無題' : 'Untitled')}
        </Text>
        {photo ? <Image source={{ uri: photo }} style={styles.thumb} /> : null}
        <Text style={{ color: t.ink, opacity: 0.75, fontSize: 13, lineHeight: 18 }} numberOfLines={photo ? 3 : 7}>
          {preview}
        </Text>
        <Text style={{ color: t.muted, fontSize: 11, marginTop: 'auto' }}>
          {d.entries.length} {ja ? '件' : d.entries.length === 1 ? 'note' : 'notes'}
        </Text>
      </Pressable>
      </FadeIn>
    );
  };

  // Two columns, filled alternately like a notes app.
  const left = list.filter((_, i) => i % 2 === 0);
  const right = list.filter((_, i) => i % 2 === 1);

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 14, paddingBottom: 30, gap: 14 }}>
      <Text style={{ fontFamily: HAND, fontSize: 36, color: t.ink, paddingHorizontal: 4 }}>{ja ? 'ページ' : 'Pages'}</Text>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={ja ? '検索' : 'Search your pages'}
        placeholderTextColor={t.muted}
        style={[styles.search, { color: t.ink, backgroundColor: t.surface, borderColor: t.line }]}
      />
      {list.length === 0 ? (
        <Text style={{ color: t.muted, textAlign: 'center', marginTop: 40 }}>
          {query ? (ja ? '見つかりません' : 'Nothing found') : ja ? '書いたり話したりすると、ここにページができます。' : 'Write or talk on the first tab and your pages appear here.'}
        </Text>
      ) : (
        <View style={styles.cols}>
          <View style={styles.col}>{left.map((d) => card(d, list.indexOf(d)))}</View>
          <View style={styles.col}>{right.map((d) => card(d, list.indexOf(d)))}</View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  search: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  cols: { flexDirection: 'row', gap: 12 },
  col: { flex: 1, gap: 12 },
  card: {
    borderRadius: 4,
    padding: 12,
    paddingTop: 16,
    gap: 6,
    minHeight: 150,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  tape: { position: 'absolute', top: -7, alignSelf: 'center', left: '35%', width: '30%', height: 14, borderRadius: 2, opacity: 0.9 },
  thumb: { width: '100%', aspectRatio: 4 / 3, borderRadius: 3 },
});
