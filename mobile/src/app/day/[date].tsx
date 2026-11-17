import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayView } from '../../components/DayView';
import { useTheme } from '../../theme';

export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const insets = useSafeAreaInsets();
  const t = useTheme();
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: t.bg }}>
      <DayView date={String(date)} />
    </View>
  );
}
