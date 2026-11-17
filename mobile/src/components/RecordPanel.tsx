import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useT } from '../lib/i18n';
import { useDiary } from '../lib/store';
import { useTheme } from '../theme';
import { fmtSeconds, useRecorder } from './useRecorder';

export function MicIcon({ color, size = 36 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Rect x={9} y={3} width={6} height={11} rx={3} />
      <Path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
    </Svg>
  );
}

/** The big record button with the live transcript. Saves the recording to today when stopped. */
export function RecordPanel({ source = 'voice', big = false }: { source?: 'voice' | 'drive'; big?: boolean }) {
  const t = useTheme();
  const s = useT();
  const addSpoken = useDiary((st) => st.addSpoken);
  const rec = useRecorder();
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const onMain = async () => {
    if (rec.state === 'idle') {
      setSavedMsg(null);
      await rec.start();
    } else if (rec.state === 'recording' || rec.state === 'paused') {
      const out = await rec.finish();
      const entry = addSpoken({ ...out, source });
      if (entry) setSavedMsg(entry.kind === 'todo' ? `${s.saved} · ${s.todo}` : s.saved);
    }
  };

  const active = rec.state === 'recording' || rec.state === 'paused';
  const size = big ? 200 : 96;

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={active ? s.stop : 'Record'}
        onPress={onMain}
        disabled={rec.state === 'finishing'}
        style={({ pressed }) => [
          styles.mic,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: t.rec,
            borderColor: t.recSoft,
            borderWidth: rec.state === 'recording' ? 14 : 10,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        {rec.state === 'finishing' ? (
          <ActivityIndicator color="#fff" />
        ) : active ? (
          <View style={{ width: size / 3.2, height: size / 3.2, borderRadius: 6, backgroundColor: '#fff' }} />
        ) : big ? (
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>{s.tapToTalkShort}</Text>
        ) : (
          <MicIcon color="#fff" />
        )}
      </Pressable>

      {active ? (
        <View style={[styles.live, { backgroundColor: t.recSoft }]}>
          <Text style={{ color: t.rec, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
            {rec.state === 'paused' ? `❚❚ ${s.paused}` : `● REC`} {fmtSeconds(rec.seconds)}
          </Text>
          <Text style={{ color: t.ink, fontSize: big ? 18 : 15, marginTop: 4 }}>{rec.transcript || s.listening}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={rec.state === 'paused' ? rec.resume : rec.pause}
            style={[styles.pause, { borderColor: t.line, backgroundColor: t.surface }]}
          >
            <Text style={{ color: t.ink, fontWeight: '600' }}>{rec.state === 'paused' ? s.resume : s.pause}</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={{ color: savedMsg ? t.ok : t.muted, textAlign: 'center', fontSize: 13, fontWeight: savedMsg ? '600' : '400' }}>
          {savedMsg ? `✓ ${savedMsg}` : big ? s.driveHint : s.tapToTalk}
        </Text>
      )}
      {rec.error ? <Text style={{ color: t.rec, fontSize: 13, textAlign: 'center' }}>{rec.error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  mic: { alignItems: 'center', justifyContent: 'center' },
  live: { alignSelf: 'stretch', borderRadius: 14, padding: 12, gap: 2 },
  pause: { alignSelf: 'flex-start', marginTop: 10, borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6 },
});
