import { Folder } from "constants/folder";
import { getDb } from "./db";
import { safeDbCall } from "./dbService";

export async function upsertFolders(folders: Folder[]) {
  const db = await getDb();

  console.log("📦 upsertFolders START");
  console.log("📊 Incoming folders count:", folders?.length);

  if (!folders || folders.length === 0) {
    console.log("⚠️ No folders provided to upsertFolders");
    return;
  }

  console.log("🧾 Sample folder (first item):", folders[0]);

  await db.withTransactionAsync(async () => {
    for (const folder of folders) {
      console.log("➡️ Inserting folder:");
      console.log({
        folderId: folder.folderId,
        userId: folder.userId,
        name: folder.folderName,
        syncStatus: folder.syncStatus,
        parentFolderId: folder.parentFolderId,
        createdAt: folder.createdAt,
      });

      try {
        const result = await db.runAsync(
          `
          INSERT INTO folders (
            folderId,
            userId,
            folderName,
            parentFolderId,
            syncStatus,
            createdAt,
            deleted
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(folderId) DO UPDATE SET
            syncStatus = 'synced',
            folderName = excluded.folderName,
            parentFolderId = excluded.parentFolderId,
            deleted = excluded.deleted
          `,
          [
            folder.folderId,
            folder.userId,
            folder.folderName,
            folder.parentFolderId ?? null,
            'synced', // important override
            new Date(folder.createdAt ?? Date.now()).getTime(),
            0,
          ]
        );

        console.log("✅ Insert success:", {
          folderId: folder.folderId,
          rowsAffected: result?.changes ?? "unknown",
          lastInsertRowId: result?.lastInsertRowId,
        });
      } catch (err) {
        console.log("❌ Insert FAILED for folder:", folder.folderId);
        console.log(err);
      }
    }
  });

  // 🔍 VERIFY AFTER INSERT
  const verify = await db.getAllAsync(`SELECT * FROM folders`);

  console.log("🔍 VERIFY folders in DB AFTER INSERT:");
  console.log("Total folders in DB:", verify.length);
  console.log(verify);
}

export async function insertFolderLocal(folder: Folder) {
  console.log("📁 INSERT FOLDER START");
  console.log("📁 Folder data:", JSON.stringify(folder, null, 2));

  const db = await getDb();

  console.log("📁 DB acquired");

  try {
    const result = await db.runAsync(
      `
      INSERT OR REPLACE INTO folders (
        folderId,
        userId,
        folderName,
        parentFolderId,
        syncStatus,
        createdAt,
        deleted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        folder.folderId,
        folder.userId,
        folder.folderName,
        folder.parentFolderId ?? null,
        folder.syncStatus,
        folder.createdAt ?? Date.now(),
        folder.deleted ?? 0,
      ]
    );

    console.log("✅ INSERT SUCCESS");
    console.log("📁 Result:", result);

    const inserted = await db.getFirstAsync(
      `SELECT * FROM folders WHERE folderId = ?`,
      [folder.folderId]
    );

    console.log("🔍 INSERTED ROW:", inserted);

    return result;
  } catch (error) {
    console.error("❌ INSERT FAILED");
    console.error("❌ Folder:", folder);
    console.error("❌ Error:", error);

    throw error;
  }
}

export async function deleteFolderLocal(folderId: string) {
  if (typeof folderId !== "string") {
    console.error("❌ Invalid folderId:", folderId);
    throw new Error("Invalid folderId");
  }

  const db = await getDb();

  console.log("🗑️ DB: soft deleting folder:", folderId);

  const check = await db.getFirstAsync(
    `SELECT * FROM folders WHERE folderId = ?`,
    [folderId]
  );

  console.log("🔍 EXISTS BEFORE DELETE:", check);

  const result = await db.runAsync(
    `
    UPDATE folders
    SET deleted = 1,
        syncStatus = 'local'
    WHERE folderId = ?
    `,
    [folderId]
  );

  console.log("🧨 DELETE RESULT:", result);
};

export async function renameFolderLocal(
  folderId: string,
  newFolderName: string
) {
  if (!folderId || !newFolderName.trim()) {
    throw new Error("Invalid folder rename parameters");
  }

  const db = await getDb();

  console.log("✏️ RENAMING FOLDER");
  console.log({
    folderId,
    newFolderName,
  });

  const result = await db.runAsync(
    `
    UPDATE folders
    SET folderName = ?,
        syncStatus = 'local'
    WHERE folderId = ?
    `,
    [newFolderName.trim(), folderId]
  );

  console.log("✅ RENAME RESULT:", result);

  const updatedFolder = await db.getFirstAsync(
    `SELECT * FROM folders WHERE folderId = ?`,
    [folderId]
  );

  console.log("📁 UPDATED FOLDER:", updatedFolder);

  return updatedFolder;
};