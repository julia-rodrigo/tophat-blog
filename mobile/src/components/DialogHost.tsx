import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDialog } from '../lib/dialog';
import { useTheme } from '../theme';

/** Renders showDialog() on the web. On Android the system dialog is used, so this stays empty. */
export function DialogHost() {
  const t = useTheme();
  const d = useDialog((s) => s.current);
  if (!d) return null;
  const close = (fn?: () => void) => {
    useDialog.setState({ current: null });
    fn?.();
  };
  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => close()}>
      <View style={styles.backdrop}>
        <View style={[styles.box, { backgroundColor: t.surface }]} accessibilityRole="alert">
          <Text style={{ fontSize: 17, fontWeight: '700', color: t.ink }}>{d.title}</Text>
          {d.message ? <Text style={{ color: t.muted, fontSize: 14, lineHeight: 20 }}>{d.message}</Text> : null}
          <View style={styles.row}>
            {d.buttons.map((b) => (
              <Pressable
                key={b.text}
                onPress={() => close(b.onPress)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.btn, { backgroundColor: b.style === 'cancel' ? t.sunk : b.style === 'destructive' ? t.recSoft : t.accentSoft, opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={{ color: b.style === 'destructive' ? t.rec : b.style === 'cancel' ? t.ink : t.accent, fontWeight: '600' }}>{b.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box: { width: '100%', maxWidth: 380, borderRadius: 18, padding: 20, gap: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', marginTop: 6 },
  btn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
});
