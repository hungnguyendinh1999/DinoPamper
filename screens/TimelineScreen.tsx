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
import { cardShadow, colors, entryTypeStyles, radius, spacing } from '../theme/theme';

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
          <Text style={styles.bannerIcon}>⏰</Text>
          <Text style={styles.bannerText}>Next feed estimated at {formatTime(nextFeedAt)}</Text>
        </View>
      )}
      {milkExpiryAt !== null && (
        <View style={[styles.banner, styles.milkBanner, milkExpired && styles.milkBannerExpired]}>
          <Text style={styles.bannerIcon}>{milkExpired ? '⚠️' : '🥛'}</Text>
          <Text style={[styles.bannerText, milkExpired && styles.bannerTextExpired]}>
            Discard milk by {formatTime(milkExpiryAt)}
          </Text>
          {milkExpired && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueBadgeText}>OVERDUE</Text>
            </View>
          )}
        </View>
      )}
      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.listContent, entries.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🦕</Text>
            <Text style={styles.emptyText}>No events logged today.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const type = entryTypeStyles[item.type];
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => openEditor(item)}
            >
              <View style={[styles.rowIcon, { backgroundColor: type.soft }]}>
                <Text style={styles.rowIconText}>{type.emoji}</Text>
              </View>
              <Text style={styles.rowType}>{type.label}</Text>
              <Text style={styles.rowTime}>{formatTime(item.createdAt)}</Text>
            </Pressable>
          );
        }}
      />
      <Pressable style={({ pressed }) => [styles.logButton, pressed && styles.logButtonPressed]} onPress={() => navigation.navigate('QuickLog')}>
        <Text style={styles.logButtonText}>+ Log Event</Text>
      </Pressable>

      <Modal visible={editingEntry !== null} animationType="slide" transparent onRequestClose={closeEditor}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {entryTypeStyles[draftType].emoji} Edit Entry
            </Text>

            <Text style={styles.modalLabel}>Type</Text>
            <View style={styles.typeRow}>
              {ENTRY_TYPES.map((type) => {
                const { emoji, label, color, soft } = entryTypeStyles[type];
                const selected = draftType === type;
                return (
                  <Pressable
                    key={type}
                    style={[
                      styles.typeButton,
                      { backgroundColor: selected ? color : soft, borderColor: color },
                    ]}
                    onPress={() => setDraftType(type)}
                  >
                    <Text style={styles.typeButtonEmoji}>{emoji}</Text>
                    <Text style={[styles.typeButtonText, { color: selected ? '#fff' : color }]}>{label}</Text>
                  </Pressable>
                );
              })}
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
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  bannerIcon: {
    fontSize: 20,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  milkBanner: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  milkBannerExpired: {
    backgroundColor: colors.warningSoft,
    borderWidth: 2,
    borderColor: colors.warning,
  },
  bannerTextExpired: {
    color: colors.warning,
    fontWeight: '700',
  },
  overdueBadge: {
    backgroundColor: colors.warning,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  overdueBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconText: {
    fontSize: 18,
  },
  rowType: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rowTime: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  logButton: {
    margin: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    ...cardShadow,
  },
  logButtonPressed: {
    opacity: 0.85,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  typeButtonEmoji: {
    fontSize: 16,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  shiftButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceAlt,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
