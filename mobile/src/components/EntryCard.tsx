import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { isValidTime, stamp } from '../lib/dates';
import { showDialog } from '../lib/dialog';
import { useT } from '../lib/i18n';
import { useDiary } from '../lib/store';
import { diffWords } from '../lib/text';
import type { Entry } from '../lib/types';
import { RULE, useTheme } from '../theme';
import { MARGIN_X } from './Paper';

const TAG: Partial<Record<Entry['kind'], { en: string; ja: string }>> = {
  voice: { en: '🎙', ja: '🎙' },
  idea: { en: 'idea', ja: 'アイデア' },
  todo: { en: '→ to-do', ja: '→ やること' },
  sound: { en: 'sound', ja: 'まわりの音' },
};

function Player({ uri }: { uri: string }) {
  const t = useTheme();
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (status.duration > 0 && status.currentTime >= status.duration - 0.1) player.seekTo(0);
      player.play();
    }
  };
  const pct = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={status.playing ? 'Pause' : 'Play'} onPress={toggle} style={styles.player}>
      <View style={[styles.playBtn, { backgroundColor: t.rec }]}>
        <Text style={{ color: '#fff', fontSize: 10 }}>{status.playing ? '❚❚' : '▶'}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: t.line }]}>
        <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: t.rec }} />
      </View>
    </Pressable>
  );
}

/** One entry written on the notepad: time in the margin, words on the lines. Tap to edit. */
export function EntryCard({ date, entry }: { date: string; entry: Entry }) {
  const t = useTheme();
  const s = useT();
  const lang = useDiary((st) => st.settings.lang);
  const moodMode = useDiary((st) => st.settings.moodMode);
  const single = useDiary((st) => st.settings.singleColor);
  const updateEntry = useDiary((st) => st.updateEntry);
  const deleteEntry = useDiary((st) => st.deleteEntry);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.text);
  const [time, setTime] = useState(entry.time);
  const [showDiff, setShowDiff] = useState(false);

  const mark = moodMode === 'off' ? 'transparent' : moodMode === 'single' ? single : t.mood[entry.mood ?? 'calm'];
  const timeOk = isValidTime(time);
  const changed = entry.originalText !== undefined && entry.originalText !== entry.text;
  const tag = TAG[entry.kind];

  const save = () => {
    if (!timeOk) return;
    updateEntry(date, entry.id, { text, time });
    setEditing(false);
  };
  const remove = () =>
    showDialog(s.delete, lang === 'ja' ? 'この記録を削除しますか？' : 'Delete this note?', [
      { text: s.cancel, style: 'cancel' },
      { text: s.delete, style: 'destructive', onPress: () => deleteEntry(date, entry.id) },
    ]);

  return (
    <View style={styles.row}>
      <View style={styles.margin}>
        <Text style={[styles.time, { color: t.muted }]}>{entry.time}</Text>
      </View>
      <View style={styles.body}>
        {entry.kind === 'photo' && entry.mediaUri ? (
          <Image source={{ uri: entry.mediaUri }} style={styles.photo} resizeMode="cover" accessibilityLabel={entry.text || 'Photo'} />
        ) : null}
        {entry.kind === 'video' ? (
          <View style={[styles.photo, styles.video, { backgroundColor: t.ink }]}>
            <Text style={{ color: t.paper, fontWeight: '600' }}>▶ {lang === 'ja' ? '動画' : 'Video'}</Text>
          </View>
        ) : null}
        {entry.kind === 'sound' && entry.mediaUri ? <Player uri={entry.mediaUri} /> : null}
        {entry.audioUris?.[0] ? <Player uri={entry.audioUris[0]} /> : null}

        {editing ? (
          <View style={{ gap: 8 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              autoFocus
              style={[styles.text, styles.input, { color: t.ink, borderColor: t.accent }]}
            />
            <View style={styles.editBar}>
              <TextInput
                value={time}
                onChangeText={setTime}
                maxLength={5}
                keyboardType="numbers-and-punctuation"
                accessibilityLabel="Time"
                style={[styles.timeInput, { color: t.ink, borderColor: timeOk ? t.line : t.rec }]}
              />
              <View style={{ flex: 1 }} />
              <Pressable onPress={remove} hitSlop={8}>
                <Text style={{ color: t.rec, fontSize: 13 }}>{s.delete}</Text>
              </Pressable>
              <Pressable onPress={() => { setEditing(false); setText(entry.text); setTime(entry.time); }} hitSlop={8}>
                <Text style={{ color: t.muted, fontSize: 13 }}>{s.cancel}</Text>
              </Pressable>
              <Pressable onPress={save} disabled={!timeOk} hitSlop={8}>
                <Text style={{ color: timeOk ? t.accent : t.muted, fontSize: 13, fontWeight: '700' }}>{s.save}</Text>
              </Pressable>
            </View>
          </View>
        ) : entry.kind === 'music' ? (
          <Pressable onPress={() => entry.link && Linking.openURL(entry.link)} onLongPress={remove}>
            <Text style={[styles.text, { color: t.ink }]}>
              <Text style={{ color: t.music }}>♪ </Text>
              {entry.text}
            </Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => setEditing(true)} onLongPress={remove} accessibilityHint="Tap to edit">
            <Text style={[styles.text, { color: t.ink }]}>
              {entry.text ? (
                <Text style={{ backgroundColor: mark }}>{entry.text}</Text>
              ) : (
                <Text style={{ color: t.muted }}>{entry.kind === 'photo' ? '' : '…'}</Text>
              )}
              {tag ? <Text style={{ color: entry.kind === 'todo' ? t.ok : t.muted, fontSize: 12 }}>{'  '}{tag[lang]}</Text> : null}
            </Text>
          </Pressable>
        )}

        {!editing && entry.updatedAt ? (
          <Text style={[styles.meta, { color: t.muted }]}>
            {s.created} {stamp(entry.createdAt, lang)} · {s.lastUpdated} {stamp(entry.updatedAt, lang)}
            {changed ? (
              <Text onPress={() => setShowDiff((v) => !v)} style={{ color: t.accent, textDecorationLine: 'underline' }}>
                {'  '}
                {showDiff ? s.hideChanges : s.seeChanges}
              </Text>
            ) : null}
          </Text>
        ) : null}
        {changed && showDiff && !editing ? (
          <Text style={[styles.diff, { backgroundColor: t.sunk }]}>
            {diffWords(entry.originalText!, entry.text).map((p, i) => (
              <Text
                key={i}
                style={
                  p.type === 'removed'
                    ? { color: t.rec, textDecorationLine: 'line-through' }
                    : p.type === 'added'
                      ? { color: t.ok, backgroundColor: t.mood.proud }
                      : { color: t.ink }
                }
              >
                {p.text}
              </Text>
            ))}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  margin: { width: MARGIN_X, paddingLeft: 6 },
  time: { fontSize: 11, lineHeight: RULE, fontVariant: ['tabular-nums'] },
  body: { flex: 1, paddingRight: 16, gap: 4 },
  text: { fontSize: 17, lineHeight: RULE },
  input: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 6, minHeight: RULE * 2, textAlignVertical: 'top' },
  editBar: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  timeInput: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, width: 64, fontVariant: ['tabular-nums'] },
  meta: { fontSize: 11, lineHeight: 16 },
  diff: { borderRadius: 6, padding: 6, fontSize: 14, lineHeight: 20 },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 6, marginVertical: 6 },
  video: { alignItems: 'center', justifyContent: 'center', aspectRatio: 16 / 9 },
  player: { flexDirection: 'row', alignItems: 'center', gap: 10, height: RULE },
  playBtn: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden', maxWidth: 160 },
});
