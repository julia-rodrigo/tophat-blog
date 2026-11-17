import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { DayView } from '../../components/DayView';
import { dateKey } from '../../lib/dates';

export default function TodayScreen() {
  // Roll over to the new day if the app stays open past midnight.
  const [today, setToday] = useState(dateKey());
  useEffect(() => {
    const check = () => setToday(dateKey());
    const timer = setInterval(check, 60_000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  return <DayView date={today} showBrand />;
}
