import type { MaterialCommunityIcons } from '@expo/vector-icons';

import type { EntryType } from '../db/entries';

type MCIName = keyof typeof MaterialCommunityIcons.glyphMap;

export const colors = {
  background: '#FAF6EC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1ECDD',
  border: '#E6DFCC',
  textPrimary: '#33402F',
  textSecondary: '#8A9184',
  primary: '#6E9075',
  primaryDark: '#547459',
  primarySoft: '#E4EEE1',
  warning: '#C1462F',
  warningSoft: '#FBE4DD',
  warningBorder: '#E8A38C',
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

export const entryTypeStyles: Record<EntryType, { icon: MCIName; label: string; color: string; soft: string }> = {
  feed: { icon: 'baby-bottle-outline', label: 'Feed', color: '#C97A3D', soft: '#FBEAD8' },
  sleep: { icon: 'weather-night', label: 'Sleep', color: '#6C7BAE', soft: '#E7E9F6' },
  diaper: { icon: 'human-baby-changing-table', label: 'Diaper', color: '#9A7C53', soft: '#F1E8D9' },
};
