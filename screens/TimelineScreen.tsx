import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

import { Entry, EntryType, getLastEntryByType, getTodaysEntries, updateEntry } from '../db/entries';
import { computeMilkExpiry, computeNextFeedTime } from '../lib/feedingEstimates';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { getNightWindow, NightWindow } from '../storage/nightWindow';

const ENTRY_LABELS: Record<EntryType, string> = {
  feed: 'Feed',
  sleep: 'Sleep',
  diaper: 'Diaper',
};

const ENTRY_TYPES: EntryType[] = ['feed', 'sleep', 'diaper'];

const TIME_SHIFTS_MS = [-60 * 60_000, -15 * 60_000, 15 * 60_000, 60 * 60_000];

function formatTimeShift(ms: number): string {
  const minutes = ms / 60_000;
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return abs >= 60 ? `${sign}${abs / 60}h` : `${sign}${abs}m`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TimelineScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Timeline'>>();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [lastFeedEntry, setLastFeedEntry] = useState<Entry | null>(null);
  const [nightWindow, setNightWindowState] = useState<NightWindow | null>(null);
  const [now, setNow] = useState(Date.now());
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [draftType, setDraftType] = useState<EntryType>('feed');
  const [draftCreatedAt, setDraftCreatedAt] = useState(Date.now());

  const refresh = useCallback(
    async (cancelledRef?: { current: boolean }) => {
      const [todaysEntries, lastFeed, window] = await Promise.all([
        getTodaysEntries(db),
        getLastEntryByType(db, 'feed'),
        getNightWindow(),
      ]);
      if (cancelledRef?.current) return;
      setEntries(todaysEntries);
      setLastFeedEntry(lastFeed);
      setNightWindowState(window);
      setNow(Date.now());
    },
    [db]
  );

  useFocusEffect(
    useCallback(() => {
      const cancelledRef = { current: false };
      refresh(cancelledRef);
      return () => {
        cancelledRef.current = true;
      };
    }, [refresh])
  );

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  function openEditor(entry: Entry) {
    setEditingEntry(entry);
    setDraftType(entry.type);
    setDraftCreatedAt(entry.createdAt);
  }

  function closeEditor() {
    setEditingEntry(null);
  }

  async function saveEdit() {
    if (!editingEntry) return;
    await updateEntry(db, editingEntry.id, { type: draftType, createdAt: draftCreatedAt });
    closeEditor();
    refresh();
  }

  const nextFeedAt =
    lastFeedEntry && nightWindow ? computeNextFeedTime(lastFeedEntry.createdAt, nightWindow) : null;
  const milkExpiryAt = lastFeedEntry ? computeMilkExpiry(lastFeedEntry.createdAt) : null;
  const milkExpired = milkExpiryAt !== null && now >= milkExpiryAt;

  return (
    <View style={styles.container}>
      {nextFeedAt !== null && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Next feed estimated at {formatTime(nextFeedAt)}</Text>
        </View>
      )}
      {milkExpiryAt !== null && (
        <View style={[styles.banner, milkExpired && styles.bannerWarning]}>
          <Text style={[styles.bannerText, milkExpired && styles.bannerWarningText]}>
            Discard milk by {formatTime(milkExpiryAt)}
          </Text>
        </View>
      )}
      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={entries.length === 0 && styles.emptyList}
        ListEmptyComponent={<Text style={styles.emptyText}>No events logged today.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openEditor(item)}>
            <Text style={styles.rowType}>{ENTRY_LABELS[item.type]}</Text>
            <Text style={styles.rowTime}>{formatTime(item.createdAt)}</Text>
          </Pressable>
        )}
      />
      <Pressable style={styles.logButton} onPress={() => navigation.navigate('QuickLog')}>
        <Text style={styles.logButtonText}>Log Event</Text>
      </Pressable>

      <Modal visible={editingEntry !== null} animationType="slide" transparent onRequestClose={closeEditor}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Entry</Text>

            <Text style={styles.modalLabel}>Type</Text>
            <View style={styles.typeRow}>
              {ENTRY_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={[styles.typeButton, draftType === type && styles.typeButtonSelected]}
                  onPress={() => setDraftType(type)}
                >
                  <Text style={[styles.typeButtonText, draftType === type && styles.typeButtonTextSelected]}>
                    {ENTRY_LABELS[type]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalLabel}>Time</Text>
            <Text style={styles.timeValue}>{formatTime(draftCreatedAt)}</Text>
            <View style={styles.typeRow}>
              {TIME_SHIFTS_MS.map((shift) => (
                <Pressable
                  key={shift}
                  style={styles.shiftButton}
                  onPress={() => setDraftCreatedAt((prev) => prev + shift)}
                >
                  <Text style={styles.shiftButtonText}>{formatTimeShift(shift)}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={closeEditor}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.saveButton]} onPress={saveEdit}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  banner: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#eaf0fe',
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2f6fed',
    textAlign: 'center',
  },
  bannerWarning: {
    backgroundColor: '#fdeceb',
  },
  bannerWarningText: {
    color: '#d64545',
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginTop: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: '#2f6fed',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  shiftButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2f6fed',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
