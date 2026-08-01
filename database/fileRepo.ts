import { getDb } from './db';
import { File } from 'constants/file';

export async function upsertFiles(files: File[]) {
  const db = await getDb();

  console.log("📦 upsertFiles START");
  console.log("📊 Incoming files count:", files?.length);

  if (!files || files.length === 0) {
    console.log("⚠️ No files provided");
    return;
  }

  console.log("🧾 Sample file:", files[0]);

  await db.withTransactionAsync(async () => {
    for (const file of files) {
      console.log("➡️ Processing file:");
      console.log({
        fileId: file.fileId,
        fileName: file.fileName,
        contentType: file.contentType,
        fileSize: file.fileSize,
        parentFolderId: file.parentFolderId,
        key: file.key,
        thumbnailKey: file.thumbnailKey,
        status: file.status,
        uploadedAt: file.uploadedAt,
        updatedAt: file.updatedAt,
      });

      try {
        const result = await db.runAsync(
          `
          INSERT OR REPLACE INTO files (
            fileId,
            userId,
            fileName,
            contentType,
            fileSize,
            parentFolderId,
            s3Key,
            thumbnailKey,
            status,
            uploadedAt,
            updatedAt,
            deleted
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            file.fileId,
            file.userId,
            file.fileName,
            file.contentType,
            file.fileSize,
            file.parentFolderId ?? null,
            file.key,
            file.thumbnailKey ?? null,
            file.status,
            file.uploadedAt,
            file.updatedAt ?? Date.now(),
            0,
          ]
        );

        console.log("✅ FILE INSERT SUCCESS:", {
          fileId: file.fileId,
          rowsAffected: result?.changes ?? "unknown",
          lastInsertRowId: result?.lastInsertRowId,
        });
      } catch (err) {
        console.log("❌ FILE INSERT FAILED:", file.fileId);
        console.log("Error:", err);
      }
    }
  });

  // 🔍 VERIFY DB STATE
  const verify = await db.getAllAsync(`SELECT * FROM files`);

  console.log("🔍 VERIFY files in DB AFTER INSERT:");
  console.log("Total files:", verify.length);
  console.log(verify);
};

export async function getFilesFromDb(parentFolderId?: string) {
    const db = await getDb();

    if (parentFolderId) {
        return db.getAllAsync(
        `
        SELECT *
        FROM files
        WHERE parentFolderId = ?
        AND deleted = 0
        ORDER BY updatedAt DESC
        `,
        [parentFolderId]
        );
    }

    return db.getAllAsync(
        `
        SELECT *
        FROM files
        WHERE parentFolderId IS NULL
        AND deleted = 0
        ORDER BY updatedAt DESC
        `
    );
};

export async function getItemsFromDb(parentFolderId?: string) {
  const db = await getDb();

  const isRoot = parentFolderId == null;

  const files = await db.getAllAsync(
    `
    SELECT *
    FROM files
    WHERE ${isRoot ? "parentFolderId IS NULL" : "parentFolderId = ?"}
    AND deleted = 0
    `,
    isRoot ? [] : [parentFolderId]
  );

  const folders = await db.getAllAsync(
    `
    SELECT *
    FROM folders
    WHERE ${isRoot ? "parentFolderId IS NULL" : "parentFolderId = ?"}
    AND deleted = 0
    `,
    isRoot ? [] : [parentFolderId]
  );

  console.log("Getting folders: ", folders);

  return [
    ...folders.map(f => ({ ...f, type: "folder" })),
    ...files.map(f => ({ ...f, type: "file" }))
  ].sort((a, b) => b.createdAt - a.createdAt);
};