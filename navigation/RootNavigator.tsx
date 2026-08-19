import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, StyleSheet } from 'react-native';

import QuickLogScreen from '../screens/QuickLogScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TimelineScreen from '../screens/TimelineScreen';
import { colors } from '../theme/theme';

export type RootStackParamList = {
  Timeline: undefined;
  QuickLog: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Timeline"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Timeline"
          component={TimelineScreen}
          options={({ navigation }) => ({
            title: 'Timeline',
            headerRight: () => (
              <Pressable
                onPress={() => navigation.navigate('Settings')}
                hitSlop={10}
                style={styles.gearButton}
              >
                <MaterialCommunityIcons name="cog-outline" size={22} color={colors.textPrimary} />
              </Pressable>
            ),
          })}
        />
        <Stack.Screen name="QuickLog" component={QuickLogScreen} options={{ title: 'Quick Log' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  gearButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
