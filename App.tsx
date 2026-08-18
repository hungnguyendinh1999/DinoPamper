import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { migrateDbIfNeeded } from './db/schema';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="dinopamper.db" onInit={migrateDbIfNeeded}>
        <RootNavigator />
        <StatusBar style="auto" />
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
