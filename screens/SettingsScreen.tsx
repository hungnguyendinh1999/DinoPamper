import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getNightWindow, NightWindow, setNightWindow } from '../storage/nightWindow';
import { cardShadow, colors, radius, spacing } from '../theme/theme';

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

function cycleHour(hour: number, delta: number): number {
  return (hour + delta + 24) % 24;
}

function StepperRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable style={styles.stepperButton} onPress={() => onChange(cycleHour(value, -1))} hitSlop={6}>
          <Text style={styles.stepperButtonText}>–</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{formatHour(value)}</Text>
        <Pressable style={styles.stepperButton} onPress={() => onChange(cycleHour(value, 1))} hitSlop={6}>
          <Text style={styles.stepperButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const [window, setWindow] = useState<NightWindow | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getNightWindow().then(setWindow);
  }, []);

  if (!window) return null;

  async function save() {
    await setNightWindow(window!);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🌙 Night Window</Text>
      <Text style={styles.sectionDescription}>
        Feeds logged during this window use the longer (night) interval for the next-feed estimate.
      </Text>

      <StepperRow label="Starts" value={window.startHour} onChange={(startHour) => setWindow({ ...window, startHour })} />
      <StepperRow label="Ends" value={window.endHour} onChange={(endHour) => setWindow({ ...window, endHour })} />

      <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]} onPress={save}>
        <Text style={styles.saveButtonText}>{saved ? '✓ Saved' : 'Save'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 18,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...cardShadow,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  stepperButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  stepperButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 78,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    ...cardShadow,
  },
  saveButtonPressed: {
    opacity: 0.85,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
