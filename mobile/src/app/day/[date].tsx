import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EntryCard } from '../../components/EntryCard';
import { BackIcon, DotsIcon } from '../../components/icons';
import { MARGIN_X, Paper } from '../../components/Paper';
import { longDate } from '../../lib/dates';
import { showDialog } from '../../lib/dialog';
import { saveDayToFolder, shareDay } from '../../lib/files';
import { useDiary } from '../../lib/store';
import { HAND, RULE, useTheme } from '../../theme';

/** One day's page in the diary, written out like a notepad page. */
export default function DayPage() {
  const { date: raw } = useLocalSearchParams<{ date: string }>();
  const date = String(raw);
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const lang = useDiary((s) => s.settings.lang);
  const ja = lang === 'ja';
  const day = useDiary((s) => s.days[date]);
  const renameDay = useDiary((s) => s.renameDay);
  const [name, setName] = useState(day?.name ?? '');
  useEffect(() => setName(day?.name ?? ''), [day?.name]);

  const entries = [...(day?.entries ?? [])].sort((a, b) => a.time.localeCompare(b.time));
  const lines = Math.max(18, entries.length * 3 + 8);

  const menu = () => {
    if (!day?.entries.length) return;
    showDialog(ja ? 'このページ' : 'This page', ja ? '文章と写真を .zip にまとめてダウンロードします。' : 'Download this page as one .zip with the text and photos.', [
      { text: ja ? 'キャンセル' : 'Cancel', style: 'cancel' },
      { text: ja ? '共有' : 'Share', onPress: () => shareDay(day, lang).catch((e) => showDialog('Download', String(e?.message ?? e))) },
      {
        text: ja ? 'ダウンロード' : 'Download',
        onPress: () =>
          saveDayToFolder(day, lang)
            .then((n) => showDialog(ja ? '保存しました' : 'Saved', n))
            .catch((e) => showDialog('Download', String(e?.message ?? e))),
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top }}>
      <View style={styles.top}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/pages'))} hitSlop={10} accessibilityLabel="Back" accessibilityRole="button">
          <BackIcon color={t.ink} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={menu} hitSlop={10} accessibilityLabel="Download this page" accessibilityRole="button">
          <DotsIcon color={t.ink} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Paper lines={lines} style={[styles.sheet, { borderColor: t.line }]}>
          <View style={{ paddingLeft: MARGIN_X, paddingRight: 16, paddingTop: 8 }}>
            <Text style={{ color: t.muted, fontSize: 13, lineHeight: RULE }}>{longDate(date, lang)}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              onEndEditing={() => renameDay(date, name)}
              onBlur={() => name !== (day?.name ?? '') && renameDay(date, name)}
              placeholder={ja ? '名前をつける…' : 'Name this page…'}
              placeholderTextColor={t.muted}
              style={{ fontFamily: HAND, fontSize: 34, lineHeight: RULE * 2, color: t.ink, padding: 0 }}
              accessibilityLabel="Page name"
            />
          </View>
          <View style={{ gap: 0, paddingBottom: RULE }}>
            {entries.length ? (
              entries.map((e) => <EntryCard key={e.id} date={date} entry={e} />)
            ) : (
              <Text style={{ paddingLeft: MARGIN_X, color: t.muted, fontSize: 16, lineHeight: RULE }}>
                {ja ? 'まだ何もありません。' : 'Nothing on this page yet.'}
              </Text>
            )}
          </View>
        </Paper>
        <Text style={{ textAlign: 'center', color: t.muted, fontSize: 12, marginTop: 10 }}>
          {ja ? 'タップで編集 · 長押しで削除' : 'Tap a line to edit · hold to delete'}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  sheet: { marginHorizontal: 12, borderRadius: 6, borderWidth: 1 },
});
