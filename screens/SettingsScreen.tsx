import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getNightWindow, NightWindow, setNightWindow } from '../storage/nightWindow';

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

function cycleHour(hour: number, delta: number): number {
  return (hour + delta + 24) % 24;
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
      <Text style={styles.sectionTitle}>Night Window</Text>
      <Text style={styles.sectionDescription}>
        Feeds logged during this window use the longer (night) interval for the next-feed estimate.
      </Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Starts</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepperButton}
            onPress={() => setWindow({ ...window, startHour: cycleHour(window.startHour, -1) })}
          >
            <Text style={styles.stepperButtonText}>-</Text>
          </Pressable>
          <Text style={styles.stepperValue}>{formatHour(window.startHour)}</Text>
          <Pressable
            style={styles.stepperButton}
            onPress={() => setWindow({ ...window, startHour: cycleHour(window.startHour, 1) })}
          >
            <Text style={styles.stepperButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Ends</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepperButton}
            onPress={() => setWindow({ ...window, endHour: cycleHour(window.endHour, -1) })}
          >
            <Text style={styles.stepperButtonText}>-</Text>
          </Pressable>
          <Text style={styles.stepperValue}>{formatHour(window.endHour)}</Text>
          <Pressable
            style={styles.stepperButton}
            onPress={() => setWindow({ ...window, endHour: cycleHour(window.endHour, 1) })}
          >
            <Text style={styles.stepperButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.saveButton} onPress={save}>
        <Text style={styles.saveButtonText}>{saved ? 'Saved' : 'Save'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2f6fed',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
