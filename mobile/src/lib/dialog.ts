import { Alert, Platform } from 'react-native';
import { create } from 'zustand';

export type DialogButton = { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void };
export type Dialog = { title: string; message?: string; buttons: DialogButton[] };

/** Dialog shown by <DialogHost/> on the web, where Alert.alert does nothing. */
export const useDialog = create<{ current: Dialog | null }>(() => ({ current: null }));

/** Same arguments as Alert.alert. Native Android uses the system dialog. */
export function showDialog(title: string, message?: string, buttons?: DialogButton[]) {
  const list = buttons?.length ? buttons : [{ text: 'OK' }];
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, list);
    return;
  }
  useDialog.setState({ current: { title, message, buttons: list } });
}
