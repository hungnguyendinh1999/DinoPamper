import type { SQLiteDatabase } from 'expo-sqlite';

export type EntryType = 'feed' | 'sleep' | 'diaper';

export interface Entry {
  id: number;
  type: EntryType;
  createdAt: number;
}

interface EntryRow {
  id: number;
  type: EntryType;
  created_at: number;
}

export async function createEntry(db: SQLiteDatabase, type: EntryType): Promise<void> {
  await db.runAsync('INSERT INTO entries (type, created_at) VALUES (?, ?)', type, Date.now());
}

export async function getTodaysEntries(db: SQLiteDatabase): Promise<Entry[]> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const rows = await db.getAllAsync<EntryRow>(
    'SELECT id, type, created_at FROM entries WHERE created_at >= ? ORDER BY created_at DESC',
    startOfDay.getTime()
  );

  return rows.map((row) => ({ id: row.id, type: row.type, createdAt: row.created_at }));
}
