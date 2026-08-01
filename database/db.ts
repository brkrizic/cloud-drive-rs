import * as SQLite from 'expo-sqlite';

let database: SQLite.SQLiteDatabase | null = null;

// export async function getDb() {
//   if (database) {
//     try {
//       await database.getFirstAsync("SELECT 1 as ok");
//       return database;
//     } catch (e) {
//       console.warn("⚠️ DB invalid → recreating");
//       console.error("DB validation failed: ", e);
//       database = null;
//     }
//   }

//   database = await SQLite.openDatabaseAsync('stashr.db');
//   return database;
// }

export async function getDb() {
  if (!database) {
    console.log("🟢 OPENING DATABASE");

    database = await SQLite.openDatabaseAsync("stashr.db");

    console.log("🟢 DATABASE OPENED", database);
  }

  return database;
}