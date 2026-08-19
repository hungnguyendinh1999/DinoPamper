import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { createEntry, EntryType } from '../db/entries';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { cardShadow, colors, entryTypeStyles, radius, spacing } from '../theme/theme';

const ENTRY_TYPES: EntryType[] = ['feed', 'sleep', 'diaper'];

export default function QuickLogScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'QuickLog'>>();

  async function handleLog(type: EntryType) {
    await createEntry(db, type);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>What just happened?</Text>
      {ENTRY_TYPES.map((type) => {
        const { icon, label, color, soft } = entryTypeStyles[type];
        return (
          <Pressable
            key={type}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: soft, borderColor: color },
              pressed && styles.buttonPressed,
            ]}
            onPress={() => handleLog(type)}
          >
            <MaterialCommunityIcons name={icon} size={26} color={color} />
            <Text style={[styles.buttonText, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  prompt: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 2,
    ...cardShadow,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
