import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';

import QuickLogScreen from '../screens/QuickLogScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TimelineScreen from '../screens/TimelineScreen';

export type RootStackParamList = {
  Timeline: undefined;
  QuickLog: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Timeline">
        <Stack.Screen
          name="Timeline"
          component={TimelineScreen}
          options={({ navigation }) => ({
            title: 'Timeline',
            headerRight: () => (
              <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={8}>
                <Text style={{ fontSize: 20 }}>⚙️</Text>
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
