import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export function Chip({
  label,
  onPress,
  active,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  active?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active, disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: active ? t.accent : t.line,
          backgroundColor: active ? t.accentSoft : t.surface,
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: active ? t.accent : t.ink, fontSize: 13, fontWeight: active ? '600' : '400' }}>{label}</Text>
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  kind?: 'primary' | 'plain' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const bg = kind === 'primary' ? t.accent : kind === 'danger' ? t.recSoft : t.sunk;
  const fg = kind === 'primary' ? t.surface : kind === 'danger' ? t.rec : t.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }, style]}
    >
      <Text style={{ color: fg, fontWeight: '600', fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.row}>
      {options.map(([v, label]) => (
        <Chip key={v} label={label} active={v === value} onPress={() => onChange(v)} />
      ))}
    </View>
  );
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: t.muted }, style]}>{children}</Text>;
}

export function H1({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontSize: 26, fontWeight: '800', color: t.ink }}>{children}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ fontSize: 13, color: t.muted }, style]}>{children}</Text>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: t.surface, borderColor: t.line }]}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: t.ink }}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  button: { borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  section: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
});
