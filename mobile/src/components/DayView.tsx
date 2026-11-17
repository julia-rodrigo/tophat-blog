import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dateKey, longDate } from '../lib/dates';
import { saveDayToFolder, shareDay } from '../lib/files';
import { useT } from '../lib/i18n';
import { useDiary } from '../lib/store';
import { useTheme } from '../theme';
import { AddBar } from './AddBar';
import { EntryCard } from './EntryCard';
import { Logo } from './Logo';
import { RecordPanel } from './RecordPanel';
import { Chip } from './ui';

/** One day's page. Today's page also has the recorder. */
export function DayView({ date, showBrand }: { date: string; showBrand?: boolean }) {
  const t = useTheme();
  const s = useT();
  const insets = useSafeAreaInsets();
  const lang = useDiary((st) => st.settings.lang);
  const day = useDiary((st) => st.days[date]);
  const renameDay = useDiary((st) => st.renameDay);
  const isToday = date === dateKey();
  const [name, setName] = useState(day?.name ?? '');

  useEffect(() => setName(day?.name ?? ''), [day?.name]);

  const entries = [...(day?.entries ?? [])].sort((a, b) => b.time.localeCompare(a.time));

  const download = () => {
    if (!day || !day.entries.length) {
      Alert.alert(s.download, s.nothingYet);
      return;
    }
    Alert.alert(
      s.download,
      lang === 'ja' ? 'この日の文章と写真を .zip にまとめます。' : 'One .zip with this day as text plus its photos.',
      [
        { text: s.cancel, style: 'cancel' },
        { text: lang === 'ja' ? '共有' : 'Share', onPress: () => shareDay(day, lang).catch((e) => Alert.alert(s.download, String(e?.message ?? e))) },
        {
          text: lang === 'ja' ? 'フォルダに保存' : 'Save to folder',
          onPress: () =>
            saveDayToFolder(day, lang)
              .then((n) => Alert.alert(s.saved, n))
              .catch((e) => Alert.alert(s.download, String(e?.message ?? e))),
        },
      ],
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: showBrand ? insets.top + 12 : 16, paddingBottom: 40, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      {showBrand ? (
        <View style={styles.brand}>
          <Logo size={30} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: t.ink }}>Log Day5</Text>
            <Text style={{ fontSize: 11, color: t.muted }}>{lang === 'ja' ? '一日を声で記録' : 'Log your day'}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.muted, fontSize: 12 }}>{longDate(date, lang)}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onEndEditing={() => renameDay(date, name)}
            placeholder={s.nameThisDay}
            placeholderTextColor={t.muted}
            style={{ fontSize: 26, fontWeight: '800', color: t.ink, paddingVertical: 2 }}
            accessibilityLabel="Day name"
          />
          <Text style={{ color: t.muted, fontSize: 12 }}>
            {entries.length} {s.moments}
            {day?.name ? ` · ${day.nameByUser ? s.renamed : s.autoNamed}` : ''}
          </Text>
        </View>
        <View style={{ gap: 6, alignItems: 'flex-end' }}>
          {isToday ? <Chip label={s.driveMode} onPress={() => router.push('/drive')} /> : null}
          <Chip label={s.download} onPress={download} />
        </View>
      </View>

      {isToday ? (
        <View style={{ gap: 12 }}>
          <RecordPanel />
          <AddBar />
        </View>
      ) : null}

      {entries.length ? (
        <View style={{ gap: 12 }}>
          {entries.map((e) => (
            <EntryCard key={e.id} date={date} entry={e} />
          ))}
        </View>
      ) : (
        <Text style={{ color: t.muted, textAlign: 'center', paddingVertical: 30 }}>{s.nothingYet}</Text>
      )}

      {!isToday ? (
        <Pressable onPress={() => router.back()} style={{ alignSelf: 'center' }}>
          <Text style={{ color: t.accent }}>{lang === 'ja' ? '← 戻る' : '← Back'}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  head: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
});
