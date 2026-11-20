import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { pickScreenshotText } from '../lib/ocr';
import { useDiary } from '../lib/store';
import { useTheme } from '../theme';

/**
 * Pick a screenshot (e.g. a list from another notes app), read its text, tick the lines
 * to keep, then add them as one note or as separate to-dos.
 */
export function ScreenshotImport({ open, onClose, prefer = 'note', onAdded }: { open: boolean; onClose: () => void; prefer?: 'note' | 'todo'; onAdded?: (msg: string) => void }) {
  const t = useTheme();
  const ja = useDiary((s) => s.settings.lang === 'ja');
  const addEntry = useDiary((s) => s.addEntry);
  const addTodo = useDiary((s) => s.addTodo);
  const [lines, setLines] = useState<string[] | null>(null);
  const [keep, setKeep] = useState<boolean[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setLines(null);
    setKeep([]);
    setError(null);
    setBusy(false);
  };
  const close = () => {
    reset();
    onClose();
  };

  const pick = async () => {
    setError(null);
    setBusy(true);
    try {
      const out = await pickScreenshotText();
      if (out === null) return;
      if (!out.length) setError(ja ? '文字が見つかりませんでした。' : 'No text found in that picture.');
      setLines(out);
      setKeep(out.map(() => true));
    } catch (e) {
      setError(String((e as Error)?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  const chosen = (lines ?? []).filter((_, i) => keep[i]);
  const addAsNote = () => {
    if (!chosen.length) return;
    addEntry({ kind: 'note', text: chosen.join('\n') });
    onAdded?.(ja ? 'メモに追加しました' : 'Added to today');
    close();
  };
  const addAsTodos = () => {
    if (!chosen.length) return;
    [...chosen].reverse().forEach((l) => addTodo(l, 'typed'));
    onAdded?.(ja ? `やることを${chosen.length}件追加` : `${chosen.length} to-do${chosen.length > 1 ? 's' : ''} added`);
    close();
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: t.surface }]}>
          <View style={styles.top}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: t.ink }}>{ja ? 'スクショから文字を取り込む' : 'Text from a screenshot'}</Text>
            <Pressable onPress={close} hitSlop={10}>
              <Text style={{ color: t.muted }}>{ja ? '閉じる' : 'Close'}</Text>
            </Pressable>
          </View>

          {!lines ? (
            <>
              <Text style={{ color: t.muted, fontSize: 14 }}>
                {ja
                  ? 'メモアプリなどのスクリーンショットを選ぶと、文字を読み取ります。'
                  : 'Pick a screenshot, like a list from another notes app, and the text is read for you.'}
              </Text>
              <Pressable onPress={pick} disabled={busy} style={[styles.btn, { backgroundColor: t.accent }]} accessibilityRole="button">
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{ja ? 'スクショを選ぶ' : 'Choose a screenshot'}</Text>}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={{ color: t.muted, fontSize: 13 }}>
                {ja ? '残す行を選んでください。' : 'Untick anything you don’t want.'} ({chosen.length}/{lines.length})
              </Text>
              <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: 6 }}>
                {lines.map((l, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setKeep((k) => k.map((v, j) => (j === i ? !v : v)))}
                    style={[styles.line, { backgroundColor: keep[i] ? t.accentSoft : t.sunk }]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: keep[i] }}
                  >
                    <Text style={{ color: keep[i] ? t.accent : t.muted, fontWeight: '800', width: 18 }}>{keep[i] ? '✓' : '○'}</Text>
                    <Text style={{ color: keep[i] ? t.ink : t.muted, flex: 1, fontSize: 14 }}>{l}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={prefer === 'todo' ? addAsTodos : addAsNote} disabled={!chosen.length} style={[styles.btn, { flex: 1, backgroundColor: t.accent, opacity: chosen.length ? 1 : 0.5 }]}>
                  <Text style={styles.btnText}>{prefer === 'todo' ? (ja ? 'やることに追加' : 'Add as to-dos') : ja ? 'メモに追加' : 'Add as a note'}</Text>
                </Pressable>
                <Pressable onPress={prefer === 'todo' ? addAsNote : addAsTodos} disabled={!chosen.length} style={[styles.btn, { flex: 1, backgroundColor: t.sunk, opacity: chosen.length ? 1 : 0.5 }]}>
                  <Text style={[styles.btnText, { color: t.ink }]}>{prefer === 'todo' ? (ja ? 'メモに追加' : 'Add as a note') : ja ? 'やることに追加' : 'Add as to-dos'}</Text>
                </Pressable>
              </View>
              <Pressable onPress={pick} hitSlop={8} style={{ alignSelf: 'center' }}>
                <Text style={{ color: t.accent, fontSize: 13 }}>{ja ? '別のスクショ' : 'Choose a different screenshot'}</Text>
              </Pressable>
            </>
          )}
          {error ? <Text style={{ color: t.rec, fontSize: 13 }}>{error}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(13,20,36,0.35)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  line: { flexDirection: 'row', gap: 8, padding: 10, borderRadius: 10 },
});
