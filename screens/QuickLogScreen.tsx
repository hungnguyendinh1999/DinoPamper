import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { createEntry, EntryType } from '../db/entries';
import type { RootStackParamList } from '../navigation/RootNavigator';

const BUTTONS: { type: EntryType; label: string }[] = [
  { type: 'feed', label: 'Feed' },
  { type: 'sleep', label: 'Sleep' },
  { type: 'diaper', label: 'Diaper' },
];

export default function QuickLogScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'QuickLog'>>();

  async function handleLog(type: EntryType) {
    await createEntry(db, type);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      {BUTTONS.map(({ type, label }) => (
        <Pressable key={type} style={styles.button} onPress={() => handleLog(type)}>
          <Text style={styles.buttonText}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  button: {
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#2f6fed',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
