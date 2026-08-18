import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_NIGHT_END_HOUR, DEFAULT_NIGHT_START_HOUR } from '../config/feeding';

const STORAGE_KEY = 'nightWindow';

export interface NightWindow {
  startHour: number;
  endHour: number;
}

const DEFAULT_NIGHT_WINDOW: NightWindow = {
  startHour: DEFAULT_NIGHT_START_HOUR,
  endHour: DEFAULT_NIGHT_END_HOUR,
};

export async function getNightWindow(): Promise<NightWindow> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_NIGHT_WINDOW;

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.startHour === 'number' && typeof parsed.endHour === 'number') {
      return parsed;
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_NIGHT_WINDOW;
}

export async function setNightWindow(window: NightWindow): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(window));
}
