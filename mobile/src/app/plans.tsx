import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, H1, Muted } from '../components/ui';
import { AI_TRIAL_DAYS, CREDIT_PACKS, PLANS } from '../lib/plans';
import { useTheme } from '../theme';

export default function PlansScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: 40, gap: 12 }}>
      <H1>Log Day5 plans</H1>
      <Muted>
        Recording, text and day pages are free forever. New accounts get AI free for {AI_TRIAL_DAYS} days, once. Paid plans
        open with sign-in, coming soon on Google Play.
      </Muted>
      {PLANS.map((p) => (
        <View key={p.id} style={[styles.card, { backgroundColor: t.surface, borderColor: p.id === 'ai' ? t.accent : t.line }]}>
          <View style={styles.top}>
            <Text style={{ color: t.ink, fontWeight: '700', fontSize: 16 }}>{p.name}</Text>
            <Text style={{ color: t.ink, fontWeight: '800', fontSize: 20, fontVariant: ['tabular-nums'] }}>
              {p.price}
              <Text style={{ color: t.muted, fontSize: 13, fontWeight: '400' }}>{p.per ? ` / ${p.per}` : ''}</Text>
            </Text>
          </View>
          <Text style={{ color: p.ai ? t.accent : t.muted, fontSize: 12, fontWeight: '600' }}>{p.ai ? 'Includes AI' : p.id === 'free' ? 'Base app' : 'No AI'}</Text>
          {p.features.map((f) => (
            <Text key={f} style={{ color: t.muted, fontSize: 13 }}>
              • {f}
            </Text>
          ))}
        </View>
      ))}
      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.line }]}>
        <Text style={{ color: t.ink, fontWeight: '700', fontSize: 16 }}>AI picture credits</Text>
        <Muted>Your own photos are always free. A picture made by AI costs 1 credit.</Muted>
        {CREDIT_PACKS.map((c) => (
          <View key={c.credits} style={styles.top}>
            <Text style={{ color: t.ink }}>{c.credits} credits</Text>
            <Text style={{ color: t.ink, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{c.price}</Text>
          </View>
        ))}
      </View>
      <Button label="Close" kind="plain" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 16, padding: 14, gap: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
