import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Muted } from '../../components/ui';
import { MARGIN_X, Paper } from '../../components/Paper';
import { stamp } from '../../lib/dates';
import { useT } from '../../lib/i18n';
import { useDiary } from '../../lib/store';
import { HAND, RULE, useTheme } from '../../theme';

export default function TodoScreen() {
  const t = useTheme();
  const s = useT();
  const insets = useSafeAreaInsets();
  const todos = useDiary((st) => st.todos);
  const lang = useDiary((st) => st.settings.lang);
  const { addTodo, toggleTodo, deleteTodo } = useDiary.getState();
  const [text, setText] = useState('');

  const add = () => {
    if (!text.trim()) return;
    addTodo(text, 'typed');
    setText('');
  };
  const open = todos.filter((x) => !x.done);
  const done = todos.filter((x) => x.done);
  const src = { voice: lang === 'ja' ? '声で' : 'said', drive: lang === 'ja' ? '声で' : 'said', typed: lang === 'ja' ? '入力' : 'typed' };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + 4 }}>
      <ScrollView contentContainerStyle={{ padding: 14, paddingTop: 14, gap: 10 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontFamily: HAND, fontSize: 36, color: t.ink }}>{s.todo}</Text>
        <Muted>{s.todoHint}</Muted>
        <Paper lines={Math.max(12, todos.length * 2 + 4)} style={[styles.sheet, { borderColor: t.line }]}>
        {[...open, ...done].map((x) => (
          <View key={x.id} style={styles.item}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: x.done }}
              onPress={() => toggleTodo(x.id)}
              hitSlop={8}
              style={[styles.box, { borderColor: x.done ? t.ok : t.muted, backgroundColor: x.done ? t.ok : 'transparent' }]}
            >
              {x.done ? <Text style={{ color: t.surface, fontSize: 12, fontWeight: '800' }}>✓</Text> : null}
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={{ color: x.done ? t.muted : t.ink, fontSize: 17, lineHeight: RULE, textDecorationLine: x.done ? 'line-through' : 'none' }}>
                {x.text}
              </Text>
              <Text style={{ color: t.muted, fontSize: 11, lineHeight: RULE }}>
                {src[x.source]} · {stamp(x.createdAt, lang)}
              </Text>
            </View>
            <Pressable onPress={() => deleteTodo(x.id)} hitSlop={8} accessibilityLabel={s.delete}>
              <Text style={{ color: t.muted, fontSize: 18 }}>×</Text>
            </Pressable>
          </View>
        ))}
        {todos.length === 0 ? (
          <Text style={{ paddingLeft: MARGIN_X, color: t.muted, fontSize: 16, lineHeight: RULE, paddingTop: 8 }}>
            {lang === 'ja' ? 'やることはありません 🎉' : 'Nothing to do 🎉'}
          </Text>
        ) : null}
        </Paper>
      </ScrollView>
      <View style={[styles.add, { borderTopColor: t.line, backgroundColor: t.surface }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          placeholder={s.addTodo}
          placeholderTextColor={t.muted}
          returnKeyType="done"
          style={[styles.input, { color: t.ink, borderColor: t.line }]}
        />
        <Pressable onPress={add} style={[styles.send, { backgroundColor: t.accent }]} accessibilityLabel="Add">
          <Text style={{ color: t.surface, fontSize: 20, fontWeight: '700' }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { borderRadius: 6, borderWidth: 1, paddingVertical: 8 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingLeft: MARGIN_X - 30, paddingRight: 14 },
  box: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  add: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1 },
  input: { flex: 1, borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
