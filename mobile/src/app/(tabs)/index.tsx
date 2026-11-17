import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExampleBanner } from '../../components/ExampleBanner';
import { ExtrasTray, usePickMedia } from '../../components/Extras';
import { ImageIcon, MicIcon, MoonIcon, PlusIcon, SendIcon, SunIcon } from '../../components/icons';
import { FadeIn, LiveBars, Pop, PulseRing } from '../../components/motion';
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
  const [toast, setToast] = useState<{ msg: string; n: number } | null>(null);
  const [sheetKey, setSheetKey] = useState(0);
  const dark = useDiary((s) => (s.settings.theme ?? 'light') === 'dark');
  const setSettings = useDiary((s) => s.setSettings);
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);

  const recording = rec.state === 'recording' || rec.state === 'paused' || rec.state === 'finishing';
  const count = day?.entries.length ?? 0;

  const flash = (msg: string) => {
    const n = Date.now();
    setToast({ msg, n });
    setSheetKey((k) => k + 1); // a fresh page slides in
    setTimeout(() => setToast((cur) => (cur?.n === n ? null : cur)), 1800);
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            {count ? (
              <Pressable onPress={() => router.push(`/day/${today}`)} hitSlop={8} accessibilityRole="link">
                <Text style={{ color: t.accent, fontSize: 13 }}>{ja ? `今日 (${count}) →` : `Today (${count}) →`}</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => setSettings({ theme: dark ? 'light' : 'dark' })}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <SunIcon color={t.ink} size={22} /> : <MoonIcon color={t.ink} size={22} />}
            </Pressable>
          </View>
        </View>

        <View style={{ paddingHorizontal: 12, marginBottom: 8 }}>
          <ExampleBanner />
        </View>

        <FadeIn key={sheetKey} from={sheetKey ? 26 : 10}>
        <Paper style={[styles.sheet, { borderColor: t.line }]} lines={14}>
          {recording ? (
            <View style={styles.writeArea}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: RULE }}>
                <Text style={[styles.recLabel, { color: t.rec }]}>
                  {rec.state === 'paused' ? (ja ? '一時停止中' : 'Paused') : '● REC'} {fmtSeconds(rec.seconds)}
                </Text>
                <LiveBars active={rec.state === 'recording'} color={t.rec} />
              </View>
              <Text style={[styles.writing, { color: t.ink }]}>{rec.transcript || (ja ? '聞いています…' : 'Listening…')}</Text>
            </View>
          ) : (
            <TextInput
              ref={input}
              value={text}
              onChangeText={setText}
              multiline
              placeholder={ja ? '書くか、下のマイクで話してね…' : 'Write anything, or tap the mic and talk…'}
              placeholderTextColor={t.muted}
              style={[styles.writeArea, styles.writing, { color: t.ink }]}
              accessibilityLabel="Write a note"
            />
          )}
        </Paper>
        </FadeIn>

        {toast ? (
          <Pop key={toast.n} style={{ alignSelf: 'center', marginTop: 12 }}>
            <Text style={[styles.toastPill, { color: t.ok, backgroundColor: t.surface, borderColor: t.line }]}>✓ {toast.msg}</Text>
          </Pop>
        ) : null}
        {rec.error ? <Text style={[styles.toast, { color: t.rec }]}>{rec.error}</Text> : null}

        {more && !recording ? (
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <ExtrasTray onDone={() => setMore(false)} />
          </View>
        ) : null}
      </ScrollView>

      {/* Tool bar: picture · big talk/send button in the middle · more */}
      <View style={[styles.bar, { borderTopColor: t.line, backgroundColor: t.bg }]}>
        <View style={styles.side}>
          {recording ? (
            <Pressable onPress={rec.state === 'paused' ? rec.resume : rec.pause} style={[styles.pill, { borderColor: t.line, backgroundColor: t.surface }]} accessibilityRole="button">
              <Text style={{ color: t.ink, fontWeight: '600' }}>{rec.state === 'paused' ? (ja ? '再開' : 'Resume') : ja ? '一時停止' : 'Pause'}</Text>
            </Pressable>
          ) : (
            <Pressable onPress={onImage} style={[styles.round, { backgroundColor: t.surface, borderColor: t.line }]} accessibilityLabel="Add a picture" accessibilityRole="button">
              <ImageIcon color={t.ink} size={22} />
            </Pressable>
          )}
        </View>
        {text.trim() && !recording ? (
          <Pressable onPress={send} style={[styles.big, { backgroundColor: t.accent }]} accessibilityLabel="Save note" accessibilityRole="button">
            <SendIcon color="#fff" size={30} />
          </Pressable>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <PulseRing active={rec.state === 'recording'} size={80} color={t.rec} />
          <Pressable
            onPress={onMic}
            disabled={rec.state === 'finishing'}
            style={[styles.big, { backgroundColor: t.rec, borderColor: t.recSoft, borderWidth: rec.state === 'recording' ? 10 : 6 }]}
            accessibilityLabel={recording ? 'Stop and save' : 'Record a voice note'}
            accessibilityRole="button"
          >
            {recording ? <View style={{ width: 24, height: 24, borderRadius: 5, backgroundColor: '#fff' }} /> : <MicIcon color="#fff" size={32} />}
          </Pressable>
          </View>
        )}
        <View style={[styles.side, { alignItems: 'flex-end' }]}>
          {recording ? null : (
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
          )}
        </View>
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
  toastPill: { fontSize: 14, fontWeight: '600', borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, overflow: 'hidden' },
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  side: { flex: 1, alignItems: 'flex-start' },
  round: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11 },
  big: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
});
