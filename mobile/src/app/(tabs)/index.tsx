import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExampleBanner } from '../../components/ExampleBanner';
import { ExtrasTray, usePickMedia } from '../../components/Extras';
import { ImageIcon, MicIcon, PlusIcon, SendIcon } from '../../components/icons';
import { Paper, MARGIN_X } from '../../components/Paper';
import { fmtSeconds, useRecorder } from '../../components/useRecorder';
import { dateKey, dayTitle } from '../../lib/dates';
import { useDiary } from '../../lib/store';
import { HAND, RULE, useTheme } from '../../theme';

function useToday() {
  const [today, setToday] = useState(dateKey());
  useEffect(() => {
    const check = () => setToday(dateKey());
    const timer = setInterval(check, 60_000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  return today;
}

/** The first page: a blank sheet. Write, talk, or add a picture. That's it. */
export default function WriteScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const today = useToday();
  const ja = useDiary((s) => s.settings.lang === 'ja');
  const day = useDiary((s) => s.days[today]);
  const addSpoken = useDiary((s) => s.addSpoken);
  const rec = useRecorder();
  const pickMedia = usePickMedia();
  const [text, setText] = useState('');
  const [more, setMore] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);

  const recording = rec.state === 'recording' || rec.state === 'paused' || rec.state === 'finishing';
  const count = day?.entries.length ?? 0;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const send = () => {
    const entry = addSpoken({ text, source: 'typed' });
    if (!entry) return;
    setText('');
    flash(entry.kind === 'todo' ? (ja ? 'やることに追加しました' : 'Added to your to-do') : ja ? '保存しました' : 'Saved to today');
  };

  const onMic = async () => {
    if (rec.state === 'idle') {
      if (!rec.canTalk) {
        flash(ja ? 'ここでは音声が使えません。入力してください。' : "Voice isn't available here. Type instead.");
        input.current?.focus();
        return;
      }
      await rec.start();
      return;
    }
    const out = await rec.finish();
    const entry = addSpoken({ ...out, source: 'voice' });
    if (entry) flash(entry.kind === 'todo' ? (ja ? 'やることに追加しました' : 'Added to your to-do') : ja ? '保存しました' : 'Saved to today');
  };

  const onImage = async () => {
    const n = await pickMedia();
    if (n) flash(ja ? '写真を追加しました' : n > 1 ? `${n} pictures added` : 'Picture added');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 24, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Text style={[styles.date, { color: t.ink, fontFamily: HAND }]}>{dayTitle(today, ja ? 'ja' : 'en')}</Text>
          {count ? (
            <Pressable onPress={() => router.push(`/day/${today}`)} hitSlop={8} accessibilityRole="link">
              <Text style={{ color: t.accent, fontSize: 13 }}>
                {ja ? `今日のページ (${count}) →` : `Today's page (${count}) →`}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 12, marginBottom: 8 }}>
          <ExampleBanner />
        </View>

        <Paper style={[styles.sheet, { borderColor: t.line }]} lines={14}>
          {recording ? (
            <View style={styles.writeArea}>
              <Text style={[styles.recLabel, { color: t.rec }]}>
                {rec.state === 'paused' ? (ja ? '一時停止中' : 'Paused') : '● REC'} {fmtSeconds(rec.seconds)}
              </Text>
              <Text style={[styles.writing, { color: t.ink }]}>{rec.transcript || (ja ? '聞いています…' : 'Listening…')}</Text>
            </View>
          ) : (
            <TextInput
              ref={input}
              value={text}
              onChangeText={setText}
              multiline
              placeholder={ja ? '何でも書いてね…' : 'Write anything…'}
              placeholderTextColor={t.muted}
              style={[styles.writeArea, styles.writing, { color: t.ink }]}
              accessibilityLabel="Write a note"
            />
          )}
        </Paper>

        {toast ? <Text style={[styles.toast, { color: t.ok }]}>✓ {toast}</Text> : null}
        {rec.error ? <Text style={[styles.toast, { color: t.rec }]}>{rec.error}</Text> : null}

        {more && !recording ? (
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <ExtrasTray onDone={() => setMore(false)} />
          </View>
        ) : null}
      </ScrollView>

      {/* Tool bar: picture · more · (talk or send) */}
      <View style={[styles.bar, { borderTopColor: t.line, backgroundColor: t.bg }]}>
        {recording ? (
          <Pressable onPress={rec.state === 'paused' ? rec.resume : rec.pause} style={[styles.pill, { borderColor: t.line, backgroundColor: t.surface }]} accessibilityRole="button">
            <Text style={{ color: t.ink, fontWeight: '600' }}>{rec.state === 'paused' ? (ja ? '再開' : 'Resume') : ja ? '一時停止' : 'Pause'}</Text>
          </Pressable>
        ) : (
          <>
            <Pressable onPress={onImage} style={[styles.round, { backgroundColor: t.surface, borderColor: t.line }]} accessibilityLabel="Add a picture" accessibilityRole="button">
              <ImageIcon color={t.ink} size={22} />
            </Pressable>
            <Pressable
              onPress={() => setMore((v) => !v)}
              style={[styles.round, { backgroundColor: more ? t.accentSoft : t.surface, borderColor: more ? t.accent : t.line }]}
              accessibilityLabel="More"
              accessibilityRole="button"
            >
              <View style={{ transform: [{ rotate: more ? '45deg' : '0deg' }] }}>
                <PlusIcon color={more ? t.accent : t.ink} size={22} />
              </View>
            </Pressable>
          </>
        )}
        <View style={{ flex: 1 }} />
        {text.trim() && !recording ? (
          <Pressable onPress={send} style={[styles.big, { backgroundColor: t.accent }]} accessibilityLabel="Save note" accessibilityRole="button">
            <SendIcon color="#fff" size={26} />
          </Pressable>
        ) : (
          <Pressable
            onPress={onMic}
            disabled={rec.state === 'finishing'}
            style={[styles.big, { backgroundColor: t.rec, borderColor: t.recSoft, borderWidth: rec.state === 'recording' ? 8 : 0 }]}
            accessibilityLabel={recording ? 'Stop and save' : 'Record a voice note'}
            accessibilityRole="button"
          >
            {recording ? <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: '#fff' }} /> : <MicIcon color="#fff" size={28} />}
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 18, marginBottom: 8, gap: 10 },
  date: { fontSize: 30, flexShrink: 1 },
  sheet: { marginHorizontal: 12, borderRadius: 6, borderWidth: 1, minHeight: RULE * 12 + 16 },
  writeArea: { minHeight: RULE * 12, paddingLeft: MARGIN_X, paddingRight: 16, paddingTop: 10 },
  writing: { fontSize: 18, lineHeight: RULE, textAlignVertical: 'top' },
  recLabel: { fontSize: 12, fontWeight: '700', lineHeight: RULE, fontVariant: ['tabular-nums'] },
  toast: { textAlign: 'center', marginTop: 10, fontSize: 14, fontWeight: '600' },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  round: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11 },
  big: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
});
