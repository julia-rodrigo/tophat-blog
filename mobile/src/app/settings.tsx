import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../components/Logo';
import { BackIcon } from '../components/icons';
import { Button, Chip, H1, Muted, Section, Segmented } from '../components/ui';
import { backupNowToFolder, lastAutoBackup, restoreFromFile } from '../lib/files';
import { useBackupStatus } from '../lib/backupStatus';
import { showDialog } from '../lib/dialog';
import { useT } from '../lib/i18n';
import { useDiary } from '../lib/store';
import type { Lang, MoodMode } from '../lib/types';
import { SINGLE_COLOURS, useTheme } from '../theme';

const pad = (n: number) => String(n).padStart(2, '0');

export default function SettingsScreen() {
  const t = useTheme();
  const s = useT();
  const insets = useSafeAreaInsets();
  const settings = useDiary((st) => st.settings);
  const days = useDiary((st) => st.days);
  const setSettings = useDiary((st) => st.setSettings);
  const status = useBackupStatus();
  const [busy, setBusy] = useState(false);
  const ja = settings.lang === 'ja';

  const last = status.last ?? safe(lastAutoBackup);
  const totalEntries = Object.values(days).reduce((n, d) => n + d.entries.length, 0);
  const r = settings.reminder;
  const shiftReminder = (mins: number) => {
    const total = (r.hour * 60 + r.minute + mins + 1440) % 1440;
    setSettings({ reminder: { ...r, hour: Math.floor(total / 60), minute: total % 60 } });
  };

  const run = async (fn: () => Promise<string>) => {
    setBusy(true);
    try {
      showDialog(s.backup, await fn());
    } catch (e) {
      const msg = String((e as Error)?.message ?? e);
      if (!/cancel/i.test(msg)) showDialog(s.backup, msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, gap: 14 }}>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/stats'))} hitSlop={10} accessibilityLabel="Back" accessibilityRole="button">
        <BackIcon color={t.ink} />
      </Pressable>
      <View style={styles.brand}>
        <Logo size={44} />
        <View>
          <H1>Log Day5</H1>
          <Muted>
            {Object.keys(days).length} {ja ? '日' : 'days'} · {totalEntries} {s.moments}
          </Muted>
        </View>
      </View>

      <Section title={s.language}>
        <Segmented<Lang> value={settings.lang} options={[['en', 'English'], ['ja', '日本語']]} onChange={(lang) => setSettings({ lang })} />
        <Muted>{ja ? '音声認識とアプリの表示に使います。' : 'Used for speech-to-text and the app text.'}</Muted>
      </Section>

      <Section title={ja ? '表示' : 'Appearance'}>
        <Segmented<'light' | 'dark' | 'system'>
          value={settings.theme ?? 'light'}
          options={[
            ['light', ja ? 'ライト' : 'Light'],
            ['dark', ja ? 'ダーク' : 'Dark'],
            ['system', ja ? '端末に合わせる' : 'Match phone'],
          ]}
          onChange={(theme) => setSettings({ theme })}
        />
      </Section>

      <Section title={s.moodColours}>
        <Segmented<MoodMode>
          value={settings.moodMode}
          options={[
            ['auto', ja ? '自動' : 'Auto'],
            ['single', ja ? '1色' : 'One colour'],
            ['off', ja ? 'オフ' : 'Off'],
          ]}
          onChange={(moodMode) => setSettings({ moodMode })}
        />
        {settings.moodMode === 'single' ? (
          <View style={styles.swatches}>
            {SINGLE_COLOURS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setSettings({ singleColor: c })}
                accessibilityLabel={`Colour ${c}`}
                style={[styles.swatch, { backgroundColor: c, borderColor: settings.singleColor === c ? t.accent : t.line }]}
              />
            ))}
          </View>
        ) : null}
        <Muted>{ja ? '任意：各記録に淡い気分の色をつけます。' : 'Optional: a pale colour on each note, guessed from what you said. Off by default.'}</Muted>
      </Section>

      <Section title={s.reminder}>
        <View style={styles.between}>
          <Text style={{ color: t.ink, fontSize: 15 }}>{ja ? '毎日' : 'Every day at'}</Text>
          <Switch value={r.on} onValueChange={(on) => setSettings({ reminder: { ...r, on } })} trackColor={{ true: t.accent }} />
        </View>
        {r.on ? (
          <View style={styles.time}>
            <Chip label="−30" onPress={() => shiftReminder(-30)} />
            <Text style={{ color: t.ink, fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
              {pad(r.hour)}:{pad(r.minute)}
            </Text>
            <Chip label="+30" onPress={() => shiftReminder(30)} />
          </View>
        ) : null}
      </Section>

      <Section title={ja ? '録音' : 'Recording'}>
        <View style={styles.between}>
          <Text style={{ color: t.ink, fontSize: 15, flex: 1 }}>{s.keepAudio}</Text>
          <Switch value={settings.keepAudio} onValueChange={(keepAudio) => setSettings({ keepAudio })} trackColor={{ true: t.accent }} />
        </View>
        <Muted>{ja ? 'Android 13以降で使えます。' : 'Works on Android 13 and newer. The text is always saved.'}</Muted>
      </Section>

      <Section title={s.backup}>
        <Muted>
          {ja ? 'この端末に自動保存' : 'Saved automatically on this phone'}
          {last ? ` · ${last.toLocaleString(ja ? 'ja-JP' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
        </Muted>
        {status.error ? <Text style={{ color: t.rec, fontSize: 13 }}>{status.error}</Text> : null}
        <Button
          label={busy ? '…' : ja ? '今すぐバックアップ (.zip)' : 'Back up now (.zip)'}
          disabled={busy}
          onPress={() => run(async () => `${ja ? '保存しました' : 'Saved'}: ${await backupNowToFolder()}`)}
        />
        <Button
          label={ja ? 'バックアップから復元' : 'Restore from a backup'}
          kind="plain"
          disabled={busy}
          onPress={() =>
            showDialog(
              ja ? '復元しますか？' : 'Restore?',
              ja ? '今の日記はバックアップの内容に置き換わります。' : 'Your current diary will be replaced by the backup.',
              [
                { text: s.cancel, style: 'cancel' },
                {
                  text: ja ? '復元' : 'Restore',
                  style: 'destructive',
                  onPress: () =>
                    run(async () => {
                      const res = await restoreFromFile();
                      if (!res) throw new Error('cancelled');
                      return `${ja ? '復元しました' : 'Restored'}: ${res.days} ${ja ? '日' : 'days'}`;
                    }),
                },
              ],
            )
          }
        />
        <Muted>
          {ja
            ? 'クラウドバックアップはメールでのログイン後に使えます（近日公開）。保存量はプランによって変わります。'
            : 'Cloud backup comes with email sign-in (coming soon). How much it keeps depends on your plan.'}
        </Muted>
      </Section>

      <Section title={s.plans}>
        <Muted>
          {ja
            ? '録音・文字起こし・日記ページはずっと無料。AIは14日間無料で試せます。'
            : 'Recording, text and day pages are free forever. Try AI free for 14 days.'}
        </Muted>
        <Button label={ja ? 'プランを見る' : 'See plans'} kind="plain" onPress={() => router.push('/plans')} />
      </Section>
    </ScrollView>
  );
}

function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  time: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  swatches: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2.5 },
});
