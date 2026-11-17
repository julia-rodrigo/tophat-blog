import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecordPanel } from '../components/RecordPanel';
import { useT } from '../lib/i18n';
import { useTheme } from '../theme';

/** Full screen, one huge button. Works like normal recording: tap to start, tap to stop. */
export default function DriveScreen() {
  const t = useTheme();
  const s = useT();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { backgroundColor: t.bg, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={{ color: t.muted, letterSpacing: 1, fontSize: 12 }}>{s.driveMode.toUpperCase()}</Text>
      <View style={{ alignSelf: 'stretch' }}>
        <RecordPanel source="drive" big />
      </View>
      <Pressable onPress={() => router.back()} style={[styles.exit, { borderColor: t.line }]} accessibilityRole="button">
        <Text style={{ color: t.ink, fontSize: 16 }}>{s.exitDrive}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
  exit: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 24, paddingVertical: 12 },
});
