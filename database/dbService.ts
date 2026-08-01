import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let isRunning = false;

// ✅ Validate DB connection
async function isDbAlive(database: SQLite.SQLiteDatabase) {
  try {
    await database.execAsync('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

// ✅ Get or create DB (singleton + recovery)
let database: SQLite.SQLiteDatabase | null = null;
let dbInitPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb() {
  if (database) return database;

  if (!dbInitPromise) {
    dbInitPromise = SQLite.openDatabaseAsync('stashr.db')
      .then((db) => {
        database = db;
        dbInitPromise = null;
        return db;
      })
      .catch((err) => {
        dbInitPromise = null;
        throw err;
      });
  }

  return dbInitPromise;
}

export async function resetDb() {
  try {
    database = null;
  } catch {}
}

export async function safeDbCall<T>(fn: (db: SQLite.SQLiteDatabase) => Promise<T>) {
  try {
    const db = await getDb();
    return await fn(db);
  } catch (err) {
    console.log("⚠️ DB broken. Resetting...", err);

    await resetDb();

    const db = await getDb();
    return await fn(db);
  }
}

export async function runDb<T>(task: () => Promise<T>): Promise<T> {
  while (isRunning) {
    await new Promise((res) => setTimeout(res, 10));
  }

  isRunning = true;

  try {
    const db = await getDb();
    return await task();
  } catch (err) {
    console.warn('⚠️ DB error → resetting', err);
    db = null; // force recovery
    throw err;
  } finally {
    isRunning = false;
  }
};

let dbWriteLock = false;

export async function runDbWrite(fn: () => Promise<any>) {
  while (dbWriteLock) {
    await new Promise(r => setTimeout(r, 20));
  }

  dbWriteLock = true;

  try {
    return await fn();
  } finally {
    dbWriteLock = false;
  }
}