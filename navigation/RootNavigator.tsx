import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import QuickLogScreen from '../screens/QuickLogScreen';
import TimelineScreen from '../screens/TimelineScreen';

export type RootStackParamList = {
  Timeline: undefined;
  QuickLog: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Timeline">
        <Stack.Screen name="Timeline" component={TimelineScreen} options={{ title: 'Timeline' }} />
        <Stack.Screen name="QuickLog" component={QuickLogScreen} options={{ title: 'Quick Log' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
