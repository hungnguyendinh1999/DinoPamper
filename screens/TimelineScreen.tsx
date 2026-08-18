import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

import { Entry, EntryType, getTodaysEntries } from '../db/entries';
import type { RootStackParamList } from '../navigation/RootNavigator';

const ENTRY_LABELS: Record<EntryType, string> = {
  feed: 'Feed',
  sleep: 'Sleep',
  diaper: 'Diaper',
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TimelineScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Timeline'>>();
  const [entries, setEntries] = useState<Entry[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getTodaysEntries(db).then((rows) => {
        if (!cancelled) setEntries(rows);
      });
      return () => {
        cancelled = true;
      };
    }, [db])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={entries.length === 0 && styles.emptyList}
        ListEmptyComponent={<Text style={styles.emptyText}>No events logged today.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowType}>{ENTRY_LABELS[item.type]}</Text>
            <Text style={styles.rowTime}>{formatTime(item.createdAt)}</Text>
          </View>
        )}
      />
      <Pressable style={styles.logButton} onPress={() => navigation.navigate('QuickLog')}>
        <Text style={styles.logButtonText}>Log Event</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  rowType: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowTime: {
    fontSize: 16,
    color: '#666',
  },
  logButton: {
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2f6fed',
    alignItems: 'center',
  },
  logButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
