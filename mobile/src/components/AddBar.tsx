import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { keepFile } from '../lib/files';
import { useT } from '../lib/i18n';
import { useDiary } from '../lib/store';
import { useTheme } from '../theme';
import { Button, Chip } from './ui';
import { fmtSeconds } from './useRecorder';

/** Buttons under the recorder: photo/video, sound around me, song link. */
export function AddBar() {
  const t = useTheme();
  const s = useT();
  const lang = useDiary((st) => st.settings.lang);
  const addEntry = useDiary((st) => st.addEntry);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recState = useAudioRecorderState(recorder, 500);
  const [songOpen, setSongOpen] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songLink, setSongLink] = useState('');

  const pickMedia = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], allowsMultipleSelection: true, quality: 0.85 });
    if (res.canceled) return;
    for (const a of res.assets) {
      const uri = await keepFile(a.uri, a.type === 'video' ? 'video' : 'photo');
      addEntry({ kind: a.type === 'video' ? 'video' : 'photo', text: '', mediaUri: uri, mood: 'calm' });
    }
  };

  const toggleSound = async () => {
    if (recState.isRecording) {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      if (recorder.uri) {
        const uri = await keepFile(recorder.uri, 'sound');
        const secs = Math.round((recState.durationMillis ?? 0) / 1000);
        addEntry({ kind: 'sound', text: `${fmtSeconds(secs)}`, mediaUri: uri, durationSec: secs, mood: 'calm' });
      }
      return;
    }
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Microphone', 'Turn on the microphone permission in Android settings to record sounds.');
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const saveSong = () => {
    const link = songLink.trim();
    const title = songTitle.trim() || (link ? 'Spotify song' : '');
    if (!title) return;
    addEntry({ kind: 'music', text: title, link: link || undefined, mood: 'happy' });
    setSongTitle('');
    setSongLink('');
    setSongOpen(false);
  };

  return (
    <View style={styles.bar}>
      <Chip label={s.addPhoto} onPress={pickMedia} />
      <Chip
        label={recState.isRecording ? `■ ${fmtSeconds(Math.round((recState.durationMillis ?? 0) / 1000))}` : s.addSound}
        active={recState.isRecording}
        onPress={toggleSound}
      />
      <Chip label={s.addSong} onPress={() => setSongOpen(true)} />

      <Modal visible={songOpen} transparent animationType="slide" onRequestClose={() => setSongOpen(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { backgroundColor: t.surface }]}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: t.ink }}>{lang === 'ja' ? '曲を追加' : 'Add a song'}</Text>
            <Text style={{ color: t.muted, fontSize: 13 }}>
              {lang === 'ja'
                ? 'Spotifyで「共有 → リンクをコピー」して貼り付けてください。'
                : 'In Spotify, tap Share → Copy link, then paste it here.'}
            </Text>
            <TextInput
              placeholder={lang === 'ja' ? '曲名' : 'Song name'}
              placeholderTextColor={t.muted}
              value={songTitle}
              onChangeText={setSongTitle}
              style={[styles.input, { color: t.ink, borderColor: t.line }]}
            />
            <TextInput
              placeholder="https://open.spotify.com/track/…"
              placeholderTextColor={t.muted}
              value={songLink}
              onChangeText={setSongLink}
              autoCapitalize="none"
              keyboardType="url"
              style={[styles.input, { color: t.ink, borderColor: t.line }]}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button label={s.cancel} kind="plain" onPress={() => setSongOpen(false)} style={{ flex: 1 }} />
              <Button label={s.save} onPress={saveSong} style={{ flex: 1 }} disabled={!songTitle.trim() && !songLink.trim()} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.35)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
});
