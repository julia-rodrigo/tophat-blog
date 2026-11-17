import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { showDialog } from '../lib/dialog';
import { keepFile } from '../lib/files';
import { useDiary } from '../lib/store';
import { useTheme } from '../theme';
import { MusicIcon, WaveIcon } from './icons';
import { fmtSeconds } from './useRecorder';

/** Adds photos/videos from the gallery to today's page. */
export function usePickMedia() {
  const addEntry = useDiary((st) => st.addEntry);
  return async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], allowsMultipleSelection: true, quality: 0.85 });
      if (res.canceled) return 0;
      for (const a of res.assets) {
        const uri = await keepFile(a.uri, a.type === 'video' ? 'video' : 'photo');
        addEntry({ kind: a.type === 'video' ? 'video' : 'photo', text: '', mediaUri: uri, mood: 'calm' });
      }
      return res.assets.length;
    } catch (e) {
      showDialog('Photos', String((e as Error)?.message ?? e));
      return 0;
    }
  };
}

/** The "+" tray: the extra things. Song from Spotify, sound around me. */
export function ExtrasTray({ onDone }: { onDone: () => void }) {
  const t = useTheme();
  const ja = useDiary((st) => st.settings.lang === 'ja');
  const addEntry = useDiary((st) => st.addEntry);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const rs = useAudioRecorderState(recorder, 500);
  const [songOpen, setSongOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');

  const toggleSound = async () => {
    try {
      if (rs.isRecording) {
        await recorder.stop();
        await setAudioModeAsync({ allowsRecording: false });
        if (recorder.uri) {
          const uri = await keepFile(recorder.uri, 'sound');
          const secs = Math.round((rs.durationMillis ?? 0) / 1000);
          addEntry({ kind: 'sound', text: fmtSeconds(secs), mediaUri: uri, durationSec: secs, mood: 'calm' });
        }
        onDone();
        return;
      }
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) throw new Error('mic');
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      showDialog(ja ? 'まわりの音' : 'Sound around me', ja ? 'ここでは録音できません。Androidアプリで使えます。' : "Can't record sounds here. It works in the Android app.");
    }
  };

  const saveSong = () => {
    const name = title.trim() || (link.trim() ? 'Spotify song' : '');
    if (!name) return;
    addEntry({ kind: 'music', text: name, link: link.trim() || undefined, mood: 'happy' });
    setTitle('');
    setLink('');
    setSongOpen(false);
    onDone();
  };

  return (
    <View style={styles.tray}>
      <Pressable onPress={() => setSongOpen(true)} style={[styles.item, { backgroundColor: t.surface, borderColor: t.line }]} accessibilityRole="button">
        <MusicIcon color={t.music} size={20} />
        <Text style={{ color: t.ink, fontSize: 14 }}>{ja ? '曲 (Spotify)' : 'Song (Spotify)'}</Text>
      </Pressable>
      <Pressable
        onPress={toggleSound}
        style={[styles.item, { backgroundColor: rs.isRecording ? t.recSoft : t.surface, borderColor: rs.isRecording ? t.rec : t.line }]}
        accessibilityRole="button"
      >
        <WaveIcon color={t.rec} size={20} />
        <Text style={{ color: t.ink, fontSize: 14 }}>
          {rs.isRecording ? `■ ${fmtSeconds(Math.round((rs.durationMillis ?? 0) / 1000))}` : ja ? 'まわりの音' : 'Sound around me'}
        </Text>
      </Pressable>

      <Modal visible={songOpen} transparent animationType="slide" onRequestClose={() => setSongOpen(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { backgroundColor: t.surface }]}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: t.ink }}>{ja ? '曲を追加' : 'Add a song'}</Text>
            <Text style={{ color: t.muted, fontSize: 13 }}>
              {ja ? 'Spotifyで「共有 → リンクをコピー」して貼り付け。' : 'In Spotify: Share → Copy link, then paste it here.'}
            </Text>
            <TextInput placeholder={ja ? '曲名' : 'Song name'} placeholderTextColor={t.muted} value={title} onChangeText={setTitle} style={[styles.input, { color: t.ink, borderColor: t.line }]} />
            <TextInput
              placeholder="https://open.spotify.com/track/…"
              placeholderTextColor={t.muted}
              value={link}
              onChangeText={setLink}
              autoCapitalize="none"
              keyboardType="url"
              style={[styles.input, { color: t.ink, borderColor: t.line }]}
            />
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
              <Pressable onPress={() => setSongOpen(false)} style={[styles.btn, { backgroundColor: t.sunk }]}>
                <Text style={{ color: t.ink }}>{ja ? 'キャンセル' : 'Cancel'}</Text>
              </Pressable>
              <Pressable onPress={saveSong} style={[styles.btn, { backgroundColor: t.accent }]}>
                <Text style={{ color: t.surface, fontWeight: '600' }}>{ja ? '追加' : 'Add'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tray: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(13,20,36,0.35)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  btn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
});
