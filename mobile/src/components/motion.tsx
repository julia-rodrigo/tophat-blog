import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, View, type StyleProp, type ViewStyle } from 'react-native';

const NATIVE = Platform.OS !== 'web';

/** True when the person has asked their phone for less motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

/** Slides up and fades in when it first appears. */
export function FadeIn({ children, delay = 0, style, from = 14 }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle>; from?: number }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 380, delay: reduced ? 0 : delay, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE }).start();
  }, [v, delay, reduced]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [reduced ? 0 : from, 0] });
  return <Animated.View style={[style, { opacity: v, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** Soft ring that breathes out from the record button while it's listening. */
export function PulseRing({ active, size, color }: { active: boolean; size: number; color: string }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active || reduced) {
      v.stopAnimation();
      v.setValue(0);
      return;
    }
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE }));
    loop.start();
    return () => loop.stop();
  }, [active, reduced, v]);
  if (!active) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
      }}
    />
  );
}

/** Little bouncing bars that show the app is listening. */
export function LiveBars({ active, color, count = 18 }: { active: boolean; color: string; count?: number }) {
  const reduced = useReducedMotion();
  const vals = useRef(Array.from({ length: count }, () => new Animated.Value(0.3))).current;
  useEffect(() => {
    if (!active || reduced) return;
    const loops = vals.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 0.4 + ((i * 37) % 60) / 100, duration: 260 + ((i * 53) % 220), useNativeDriver: NATIVE }),
          Animated.timing(v, { toValue: 0.15 + ((i * 17) % 20) / 100, duration: 240 + ((i * 29) % 200), useNativeDriver: NATIVE }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, reduced, vals]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 26 }}>
      {vals.map((v, i) => (
        <Animated.View key={i} style={{ width: 3, height: 26, borderRadius: 2, backgroundColor: color, transform: [{ scaleY: active ? v : 0.15 }] }} />
      ))}
    </View>
  );
}

/** A bar that grows to its size when it first shows. `size` is 0..1 of the track. */
export function GrowBar({ size, color, vertical, delay = 0, style }: { size: number; color: string; vertical?: boolean; delay?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(reduced ? size : 0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: size, duration: 600, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [size, v, delay]);
  const pct = v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return <Animated.View style={[style, { backgroundColor: color }, vertical ? { height: pct } : { width: pct }]} />;
}

/** Pops in with a little spring, for "Saved" notes. */
export function Pop({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(v, { toValue: 1, friction: 5, tension: 140, useNativeDriver: NATIVE }).start();
  }, [v]);
  return <Animated.View style={[style, { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }]}>{children}</Animated.View>;
}
