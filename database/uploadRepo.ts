import { UploadJob, UploadPart } from 'constants/job';
import { getDb } from './db';
import { safeDbCall } from './dbService';

export async function createUploadJob(job: UploadJob) {
  return safeDbCall(async () => {
    const db = await getDb();

    const normalized = {
      id: job.id,
      uploadId: job.uploadId ?? null,
      s3Key: job.s3Key ?? null,

      fileName: job.fileName,
      fileUri: job.fileUri,
      fileSize: job.fileSize ?? 0,
      contentType: job.contentType ?? null,

      uploadUrl: job.uploadUrl ?? null,
      uploadType: job.uploadType ?? "single",

      status: job.status ?? "pending",
      progress: job.progress ?? 0,

      notified: job.notified ?? 0,
      locked: job.locked ?? 0,

      isText: job.isText ? 1 : 0,
      title: job.title ?? null,
      description: job.description ?? null,

      mode: job.mode ?? "background",
      createdAt: job.createdAt ?? Date.now(),
    };

    console.log("NORMALIZED: ", normalized);

    await db.runAsync(
      `INSERT INTO uploads 
      (id, uploadId, s3Key, fileName, fileUri, fileSize, contentType, uploadUrl, uploadType, status, progress, notified, locked, isText, title, description, mode, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalized.id,
        normalized.uploadId,
        normalized.s3Key,

        normalized.fileName,
        normalized.fileUri,
        normalized.fileSize,
        normalized.contentType,

        normalized.uploadUrl,
        normalized.uploadType,

        normalized.status,
        normalized.progress,

        normalized.notified,
        normalized.locked,

        normalized.isText,
        normalized.title,
        normalized.description,

        normalized.mode,
        normalized.createdAt,
      ]
    );

    console.log("✅ Job created safely");
    return normalized;
  });
}

export async function insertUploadPart(part: UploadPart) {
  const db = await getDb();

  await db.runAsync(
    `INSERT INTO upload_parts 
     (jobId, uploadId, partNumber, url, etag, status, size)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      part.jobId,
      part.uploadId,
      part.partNumber,
      part.url ?? null,
      part.etag ?? null,
      part.status,
      part.size ?? null,
    ]
  );
};

export async function updateUploadPartsStatus({
  status,
  etag,
  jobId,
  partNumber,
}: {
  status: "pending" | "uploading" | "uploaded" | "failed";
  etag?: string | null;
  jobId: string;
  partNumber: number;
}) {
  const db = await getDb();

  await db.runAsync(
    `
    UPDATE upload_parts 
    SET status = ?, etag = COALESCE(?, etag)
    WHERE jobId = ? AND partNumber = ?
    `,
    [status, etag ?? null, jobId, partNumber]
  );
}

export async function saveUploadParts(parts: UploadPart[]) {
  const db = await getDb();

  const stmt = await db.prepareAsync(`
    INSERT INTO upload_parts 
    (jobId, uploadId, partNumber, url, etag, status, size)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    for (const part of parts) {
      await stmt.executeAsync([
        part.jobId,
        part.uploadId,
        part.partNumber,
        part.url ?? null,
        part.etag ?? null,
        part.status ?? "pending",
        part.size ?? null,
      ]);
    }
  } finally {
    await stmt.finalizeAsync();
  }
}

export async function getUploadParts(jobId: string) {
  const db = await getDb();

  return await db.getAllAsync<UploadPart>(
    `SELECT * FROM upload_parts 
     WHERE jobId = ? 
     ORDER BY partNumber ASC`,
    [jobId]
  );
}

//Update Progress
export async function updateUploadProgress(id: string, progress: number) {
  const db = await getDb();

  const result = await db.runAsync(
    `UPDATE uploads SET progress = ?, status = 'uploading' WHERE id = ?`,
    [progress, id]
  );

  console.log("Rows affected:", result.changes);
}

//Update Status
export async function updateUploadStatus(id: string, status: string) {
  const db = await getDb();

  await db.runAsync(
    `UPDATE uploads SET status = ? WHERE id = ?`,
    [status, id]
  );

  if (['completed', 'canceled', 'failed'].includes(status)) {
    await cleanupStatus(status);
  }
}

//Get All Uploads
export async function getAllUploads() {
  return safeDbCall(async (db) => {
    return await db.getAllAsync(
      `SELECT * FROM uploads ORDER BY createdAt DESC`
    );
  });
}

//Get Pending Uploads
export async function getNextPendingJob() {
  const db = await getDb();

  console.log("Getting Next Pending Job...");

  return await db.getAllAsync(
    `SELECT * FROM uploads WHERE status = 'pending' ORDER BY createdAt ASC LIMIT 1`
  );
}

//GET AND LOCK NEXT JOB
export async function getAndLockNextJob() {
  const db = await getDb();

  console.log("🔍 Getting next pending job...");

  const job = await db.getFirstAsync(
    `SELECT * FROM uploads
     WHERE status = 'pending' AND locked = 0
     ORDER BY createdAt ASC
     LIMIT 1`
  );

  if (!job) {
    console.log("📭 No pending job found");
    return null;
  }

  console.log("🔒 Locking job:", job.id);

  await db.runAsync(
    `UPDATE uploads
     SET locked = 1,
         status = 'uploading',
         progress = 0
     WHERE id = ?`,
    [job.id]
  );

  console.log("✅ Job locked:", job.id);

  return { ...job, status: "uploading", progress: 0} as UploadJob;
}

// Checking pending jobs
export async function hasPendingBackgroundJobs() {
  console.log("Checking hasPendingJob");
  const jobs = await getNextPendingJob(); // or COUNT query

  return !!jobs?.length;
}

//Reset stuck jobs on boot
export async function resetUploadingJobsToPending(){
  const db = await getDb();

  return await db.runAsync(
    `UPDATE uploads SET status = 'pending' WHERE status = 'uploading'`
  );
}


export const clearAllUploads = async () => {
  try {
    const db = await getDb();

    await db.execAsync?.("PRAGMA foreign_keys = ON");

    console.log("🧹 Clearing upload_parts...");

    await db.runAsync(`DELETE FROM upload_parts`);

    console.log("🧹 Clearing uploads...");

    await db.runAsync(`DELETE FROM uploads`);

    console.log("✅ All uploads cleared safely");
  } catch (err) {
    console.error("❌ Failed to clear uploads", err);
  }
};

export const deleteUploadJob = async (jobId: string) => {
  try {
    const db = await getDb();
    await db.runAsync(
      "DELETE FROM uploads WHERE id = ?",
      [jobId]
    )
  } catch (error) {
    console.error("Failed to delete job", error);
  }
}

export async function reconcileUploads() {
    const db = await getDb();

    return await db.getAllAsync(
      `SELECT * FROM uploads ORDER BY createdAt DESC`
    );
}

export async function markUploadAsNotified(id: string) {
  const db = await getDb();

  await db.runAsync(
    `UPDATE uploads SET notified = 1 WHERE id = ?`,
    [id]
  );
}

const MAX_PER_STATUS = 4;

export async function cleanupStatus(status: string) {
  const db = await getDb();

  console.log("🧹 Cleanup starting for:", status);

  const oldJobs = await db.getAllAsync<{ id: string }>(
    `
    SELECT id FROM uploads
    WHERE status = ?
    ORDER BY createdAt DESC
    LIMIT -1 OFFSET ?
    `,
    [status, MAX_PER_STATUS]
  );

  if (!oldJobs.length) {
    console.log("✅ Nothing to cleanup");
    return;
  }

  for (const job of oldJobs) {
    console.log("🗑 Removing upload:", job.id);

    // delete child rows FIRST
    await db.runAsync(
      `DELETE FROM upload_parts WHERE jobId = ?`,
      [job.id]
    );

    // then parent row
    await db.runAsync(
      `DELETE FROM uploads WHERE id = ?`,
      [job.id]
    );
  }

  console.log("✅ Cleanup finished");
}
