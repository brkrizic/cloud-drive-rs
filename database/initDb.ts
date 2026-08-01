import { getDb } from "./db";

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;

  try {
    console.log("Initializing database...");

    const db = await getDb();

    // -------------------------------
    // IMPORTANT: enable foreign keys (SQLite default = OFF)
    // -------------------------------
    await db.execAsync(`PRAGMA foreign_keys = ON;`);

    // await db.execAsync(`DROP TABLE IF EXISTS upload_parts;`);
    // await db.execAsync(`DROP TABLE IF EXISTS folders;`);
    // await db.execAsync(`DROP TABLE IF EXISTS files;`);

    // -------------------------------
    // Uploads table (jobs)
    // -------------------------------
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS uploads (
        id TEXT PRIMARY KEY NOT NULL,

        uploadId TEXT, -- only for multipart
        s3Key TEXT,

        fileName TEXT NOT NULL,
        fileUri TEXT NOT NULL,
        fileSize INTEGER,
        contentType TEXT,

        uploadUrl TEXT, -- only for single upload

        uploadType TEXT CHECK(uploadType IN ('single', 'multipart')),

        status TEXT CHECK(status IN ('pending', 'uploading', 'completed', 'failed', 'canceled')),

        progress REAL DEFAULT 0,

        notified INTEGER DEFAULT 0,
        locked INTEGER DEFAULT 0,

        isText INTEGER,
        title TEXT,
        description TEXT,

        mode TEXT CHECK(mode IN ('background', 'direct')),

        createdAt INTEGER
      );
    `);

    // -------------------------------
    // Upload parts (for multipart)
    // -------------------------------
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS upload_parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        jobId TEXT NOT NULL,
        uploadId TEXT NOT NULL,

        url TEXT,

        partNumber INTEGER NOT NULL,

        etag TEXT,

        status TEXT CHECK(status IN ('pending', 'uploading', 'uploaded', 'failed')) DEFAULT 'pending',

        size INTEGER,

        FOREIGN KEY (jobId) REFERENCES uploads(id)
      );
    `);
    
    // -------------------------------
    // Files table
    // -------------------------------
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS files (
        fileId TEXT PRIMARY KEY NOT NULL,

        userId TEXT NOT NULL,

        fileName TEXT NOT NULL,
        contentType TEXT,
        fileSize INTEGER,

        parentFolderId TEXT,

        s3Key TEXT NOT NULL,
        thumbnailKey TEXT,

        status TEXT,

        syncStatus TEXT,

        uploadedAt INTEGER,
        updatedAt INTEGER NOT NULL,

        deleted INTEGER DEFAULT 0,

        lastViewed INTEGER,
        lastViewedBy TEXT
      );  
    `);

    // -------------------------------
    // Folders table
    // -------------------------------
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS folders (
        folderId TEXT PRIMARY KEY NOT NULL,

        userId TEXT NOT NULL,

        folderName TEXT NOT NULL,

        parentFolderId TEXT,

        syncStatus TEXT,

        createdAt INTEGER NOT NULL,

        deleted INTEGER DEFAULT 0
      );
    `);
    
    // -------------------------------
    // Actions table
    // -------------------------------
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS actions (
        id TEXT PRIMARY KEY NOT NULL,

        type TEXT NOT NULL,

        payload TEXT NOT NULL,

        status TEXT CHECK(status IN (
          'pending',
          'processing',
          'completed',
          'failed'
        )) DEFAULT 'pending',

        retryCount INTEGER DEFAULT 0,

        createdAt INTEGER,
        updatedAt INTEGER
      );
    `)


    // -------------------------------
    // Indexes (performance for worker)
    // -------------------------------

    // For Files
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_files_parent
      ON files(parentFolderId);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_files_name
      ON files(fileName);  
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_files_updated
      ON files(updatedAt);  
    `);

    //For Folders
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_folders_parent
      ON folders(parentFolderId);  
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_files_folder
      ON files(parentFolderId);
    `);

    //For Actions
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_actions_status
      ON actions(status);  
    `);

    //For Uploads
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_upload_status
      ON uploads(status);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_parts_status
      ON upload_parts(status);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_parts_job_status
      ON upload_parts(jobId, status);
    `);

    await db.execAsync(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_parts_unique
      ON upload_parts(uploadId, partNumber);
    `);

    console.log("Database ready.");
    isInitialized = true;

  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}