import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { RULE, useTheme } from '../theme';

/** A sheet of ruled notepad paper with a red margin line. Content draws on top. */
export function Paper({
  children,
  lines = 40,
  margin = true,
  style,
}: {
  children: ReactNode;
  lines?: number;
  margin?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <View style={[styles.paper, { backgroundColor: t.paper }, style]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {Array.from({ length: lines }, (_, i) => (
          <View key={i} style={[styles.rule, { top: (i + 1) * RULE + 8, backgroundColor: t.rule }]} />
        ))}
        {margin ? <View style={[styles.margin, { backgroundColor: t.margin }]} /> : null}
      </View>
      {children}
    </View>
  );
}

export const MARGIN_X = 54;

const styles = StyleSheet.create({
  paper: { overflow: 'hidden' },
  rule: { position: 'absolute', left: 0, right: 0, height: 1 },
  margin: { position: 'absolute', top: 0, bottom: 0, left: MARGIN_X - 8, width: 1.5 },
});
