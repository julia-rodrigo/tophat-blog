import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { isValidTime, stamp } from '../lib/dates';
import { showDialog } from '../lib/dialog';
import { useT } from '../lib/i18n';
import { useDiary } from '../lib/store';
import { diffWords } from '../lib/text';
import type { Entry } from '../lib/types';
import { useTheme } from '../theme';

const KIND_LABEL: Record<Entry['kind'], { en: string; ja: string }> = {
  voice: { en: 'Voice note', ja: 'ボイスメモ' },
  idea: { en: 'Idea', ja: 'アイデア' },
  todo: { en: 'Added to to-do', ja: 'やることに追加' },
  photo: { en: 'Photo', ja: '写真' },
  video: { en: 'Video', ja: '動画' },
  sound: { en: 'Sound around me', ja: 'まわりの音' },
  music: { en: 'Song', ja: '曲' },
};

function Player({ uri }: { uri: string }) {
  const t = useTheme();
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.1)) player.seekTo(0);
      player.play();
    }
  };
  const pct = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  return (
    <Pressable accessibilityRole="button" onPress={toggle} style={styles.player}>
      <View style={[styles.playBtn, { backgroundColor: t.rec }]}>
        <Text style={{ color: '#fff', fontSize: 12 }}>{status.playing ? '❚❚' : '▶'}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: t.line }]}>
        <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: t.rec, borderRadius: 3 }} />
      </View>
    </Pressable>
  );
}

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

  const bg = moodMode === 'off' ? t.sunk : moodMode === 'single' ? single : t.mood[entry.mood ?? 'calm'];
  const kindColor =
    entry.kind === 'todo' ? t.ok : entry.kind === 'idea' ? t.accent : entry.kind === 'music' ? t.music : entry.kind === 'voice' || entry.kind === 'sound' ? t.rec : t.muted;
  const timeOk = isValidTime(time);

  const save = () => {
    if (!timeOk) return;
    updateEntry(date, entry.id, { text, time });
    setEditing(false);
  };
  const confirmDelete = () =>
    showDialog(s.delete, lang === 'ja' ? 'この記録と音声を削除しますか？' : 'Delete this entry and its recording?', [
      { text: s.cancel, style: 'cancel' },
      { text: s.delete, style: 'destructive', onPress: () => deleteEntry(date, entry.id) },
    ]);

  const changed = entry.originalText !== undefined && entry.originalText !== entry.text;

  return (
    <View style={styles.row}>
      <Text style={[styles.time, { color: t.muted }]}>{entry.time}</Text>
      <View style={[styles.card, { backgroundColor: bg }]}>
        <View style={styles.top}>
          <Text style={[styles.kind, { color: kindColor }]}>{KIND_LABEL[entry.kind][lang]}</Text>
          <View style={styles.acts}>
            {editing ? (
              <>
                <Pressable onPress={() => { setEditing(false); setText(entry.text); setTime(entry.time); }} hitSlop={8}>
                  <Text style={[styles.act, { color: t.muted }]}>{s.cancel}</Text>
                </Pressable>
                <Pressable onPress={save} hitSlop={8} disabled={!timeOk}>
                  <Text style={[styles.act, { color: timeOk ? t.accent : t.muted, fontWeight: '700' }]}>{s.save}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable onPress={() => setEditing(true)} hitSlop={8}>
                  <Text style={[styles.act, { color: t.muted }]}>{s.edit}</Text>
                </Pressable>
                <Pressable onPress={confirmDelete} hitSlop={8}>
                  <Text style={[styles.act, { color: t.muted }]}>{s.delete}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {entry.kind === 'photo' && entry.mediaUri ? (
          <Image source={{ uri: entry.mediaUri }} style={styles.photo} resizeMode="cover" accessibilityLabel={entry.text || 'Photo'} />
        ) : null}
        {entry.kind === 'video' ? (
          <View style={[styles.photo, styles.video, { backgroundColor: t.ink }]}>
            <Text style={{ color: t.bg, fontWeight: '600' }}>▶ {lang === 'ja' ? '動画' : 'Video'}</Text>
          </View>
        ) : null}
        {entry.kind === 'sound' && entry.mediaUri ? <Player uri={entry.mediaUri} /> : null}
        {(entry.kind === 'voice' || entry.kind === 'idea' || entry.kind === 'todo') && entry.audioUris?.[0] ? (
          <Player uri={entry.audioUris[0]} />
        ) : null}

        {editing ? (
          <>
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              autoFocus
              style={[styles.input, { color: t.ink, backgroundColor: t.surface, borderColor: t.accent }]}
            />
            <View style={styles.timeRow}>
              <Text style={{ color: t.muted, fontSize: 13 }}>{lang === 'ja' ? '時刻' : 'Time'}</Text>
              <TextInput
                value={time}
                onChangeText={setTime}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                style={[styles.timeInput, { color: t.ink, backgroundColor: t.surface, borderColor: timeOk ? t.line : t.rec }]}
              />
              {!timeOk ? <Text style={{ color: t.rec, fontSize: 12 }}>HH:MM</Text> : null}
            </View>
          </>
        ) : entry.kind === 'music' ? (
          <Pressable onPress={() => entry.link && Linking.openURL(entry.link)} disabled={!entry.link}>
            <Text style={[styles.text, { color: t.ink, fontWeight: '600' }]}>♪ {entry.text}</Text>
            {entry.link ? <Text style={{ color: t.music, fontSize: 12 }}>{lang === 'ja' ? 'Spotifyで再生' : 'Play in Spotify'}</Text> : null}
          </Pressable>
        ) : entry.text ? (
          <Text style={[styles.text, { color: t.ink }]}>{entry.text}</Text>
        ) : null}

        {entry.updatedAt ? (
          <Text style={[styles.meta, { color: t.muted }]}>
            {s.created} {stamp(entry.createdAt, lang)} · {s.lastUpdated} {stamp(entry.updatedAt, lang)}
            {entry.originalTime && entry.originalTime !== entry.time ? ` · ${entry.originalTime} → ${entry.time}` : ''}
          </Text>
        ) : null}
        {changed ? (
          <Pressable onPress={() => setShowDiff((v) => !v)} hitSlop={6}>
            <Text style={{ color: t.accent, fontSize: 12, textDecorationLine: 'underline', marginTop: 2 }}>
              {showDiff ? s.hideChanges : s.seeChanges}
            </Text>
          </Pressable>
        ) : null}
        {changed && showDiff ? (
          <Text style={[styles.diff, { backgroundColor: t.surface }]}>
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
        {moodMode === 'auto' && entry.mood ? <Text style={[styles.meta, { color: t.muted }]}>mood · {entry.mood}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  time: { width: 44, paddingTop: 10, fontSize: 12, fontVariant: ['tabular-nums'] },
  card: { flex: 1, borderRadius: 14, padding: 12, gap: 6 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kind: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  acts: { flexDirection: 'row', gap: 14 },
  act: { fontSize: 12 },
  text: { fontSize: 15, lineHeight: 21 },
  input: { borderWidth: 1.5, borderRadius: 10, padding: 8, fontSize: 15, minHeight: 60, textAlignVertical: 'top' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, width: 70, fontVariant: ['tabular-nums'] },
  meta: { fontSize: 11 },
  diff: { borderRadius: 8, padding: 8, fontSize: 13, lineHeight: 19 },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 10 },
  video: { alignItems: 'center', justifyContent: 'center', aspectRatio: 16 / 9 },
  player: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 },
  playBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
});
