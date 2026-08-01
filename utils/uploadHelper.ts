import { UploadJob } from 'constants/job';
import {
  getUploadParts,
  updateUploadPartsStatus,
  updateUploadProgress,
  updateUploadStatus,
} from 'database/uploadRepo';
import RNFetchBlob from 'react-native-blob-util';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
import { queryClient } from 'App';
import axios from 'axios';
import { completeMultipartUpload } from 'services/fileService';

// Upload Emitter
export const uploadEvents = new EventEmitter();

/* =========================
   Upload single file
========================= */
export const uploadSingleFile = async (job: UploadJob) => {
  const startTime = Date.now();

  console.log(`[UploadFile] Start upload for job: ${job.id}`);

  // const body = job.isText
  // ? job.description || ""
  // : RNFetchBlob.wrap(job.fileUri);

  const body = RNFetchBlob.wrap(job.fileUri);

  return RNFetchBlob
    .config({ timeout: 60000 })
    .fetch(
      'PUT',
      job.uploadUrl!,
      { 'Content-Type': job.contentType },
      body
    )
    .uploadProgress({ interval: 100 }, async (sent, total) => {
      if (!total) return;

      const percent = ((sent / total) * 100).toFixed(2);

      console.log(`[UploadFile] Job ${job.id} progress: ${percent}%`);

      uploadEvents.emit("progress", {
        jobId: job.id,
        progress: parseFloat(percent),
      });

      // 1️⃣ Update DB
      await updateUploadProgress(job.id, parseFloat(percent)).catch(() => {});

    })
    .then((res) => {
      const endTime = Date.now();
      const uploadTimeSeconds = (endTime - startTime) / 1000;

      console.log(uploadTimeSeconds);

      console.log({
        fileSizeMB: (job.fileSize / (1024 * 1024)).toFixed(2),
        uploadTimeSeconds,
      });

      console.log(`[UploadFile] Job ${job.id} finished with status ${res.info().status}`);

      uploadEvents.emit("done", {
        jobId: job.id,
      });

      console.log("UPLOAD FILE:", job.fileUri);
      console.log("EXPECTED SIZE:", job.fileSize);
    })
    .catch(async (err) => {
      console.error(`[UploadFile] Job ${job.id} failed`, err);

        try {
          // 1️⃣ Update DB
          await updateUploadStatus(job.id, "failed");

          // 2️⃣ Update React Query cache
          queryClient.setQueryData<UploadJob[]>(["uploads"], (old = []) =>
            old.map(j =>
              j.id === job.id
                ? { ...j, status: "failed" }
                : j
            )
          );

          // 3️⃣ Optional: notify UI layer
          uploadEvents.emit("failed", {
            jobId: job.id,
          });

        } catch (innerErr) {
          console.error("❌ Failed to update failure state:", innerErr);
        }  

      throw err;
    });
};



const CHUNK_SIZE = 25 * 1024 * 1024; // 25MB

/* =========================
   Upload multipart file
========================= */
export async function uploadMultipartFile(job: UploadJob) {
  console.log("🚀 MULTIPART START");
  console.log("Job ID:", job.id);
  console.log("UploadId:", job.uploadId);
  console.log("S3 Key:", job.s3Key);
  console.log("File URI:", job.fileUri);
  console.log("File Size:", job.fileSize);
  console.log("Chunk Size:", CHUNK_SIZE);
  console.log("==================================");

  const parts = await getUploadParts(job.id);

  if (!parts?.length) {
    throw new Error("No upload parts found");
  }

  console.log(`📦 Parts fetched: ${parts.length}`);

  const etags: { PartNumber: number; ETag: string }[] = [];

  const filePath = job.fileUri;
  const fileSize = job.fileSize;

  let done = 0;

  for (const part of parts) {
    const start = (part.partNumber - 1) * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, fileSize);
    const length = end - start;

    console.log("\n----------------------------------");
    console.log(`⬆️ START PART ${part.partNumber}`);
    console.log("Start byte:", start);
    console.log("End byte:", end);
    console.log("Length:", length);
    console.log("Upload URL:", part.url);

    try {
      // 🔥 CRITICAL FIX: REAL FILE SLICE
      const tempPath =
        `${RNFetchBlob.fs.dirs.CacheDir}/part-${part.partNumber}`;

      await RNFetchBlob.fs.slice(
        filePath,
        tempPath,
        start,
        end
      );

      const res = await RNFetchBlob.fetch(
        "PUT",
        part.url,
        {
          "Content-Type": "application/octet-stream",
        },
        RNFetchBlob.wrap(tempPath)
      );

      await RNFetchBlob.fs.unlink(tempPath);

      const info = res.info();

      console.log("📡 HTTP STATUS:", info.status);
      console.log("📡 RESPONSE HEADERS:", info.headers);

      let etag =
        info.headers["etag"] ||
        info.headers["ETag"] ||
        info.headers["Etag"];

      if (!etag) {
        throw new Error(`Missing ETag for part ${part.partNumber}`);
      }

      etag = etag.replace(/"/g, "");

      console.log("🧾 CLEAN ETag:", etag);

      etags.push({
        PartNumber: part.partNumber,
        ETag: etag,
      });

      await updateUploadPartsStatus({
        jobId: job.id,
        partNumber: part.partNumber,
        status: "uploaded",
        etag,
      });

      done++;

      const progress = Math.floor((done / parts.length) * 100);

      uploadEvents.emit("progress", {
        jobId: job.id,
        progress: progress,
      });

      console.log("📊 Progress:", progress + "%");

      await updateUploadProgress(job.id, progress);

      console.log(`✅ PART ${part.partNumber} DONE`);
    } catch (err) {
      console.log(`❌ PART ${part.partNumber} FAILED`);
      console.log(err);

      await updateUploadPartsStatus({
        jobId: job.id,
        partNumber: part.partNumber,
        status: "failed",
      });

      await updateUploadStatus(job.id, "failed");

      throw err;
    }
  }

  console.log("\n==================================");
  console.log("✅ ALL PARTS FINISHED");
  console.log("ETAGS COLLECTED:", etags.length);
  console.log("==================================");

  const sortedParts = etags
    .sort((a, b) => a.PartNumber - b.PartNumber)
    .map((p) => ({
      PartNumber: p.PartNumber,
      ETag: p.ETag,
    }));

  console.log("📦 FINAL SORTED PARTS:");
  console.log(JSON.stringify(sortedParts, null, 2));

  console.log("\n🚀 CALLING COMPLETE MULTIPART...");

  try {
    const result = await completeMultipartUpload({
      uploadId: job.uploadId!,
      key: job.s3Key!,
      parts: sortedParts,
    });

    console.log("🎉 COMPLETE SUCCESS:", result);

    await updateUploadStatus(job.id, "completed");
  } catch (err) {
    console.log("❌ COMPLETE MULTIPART FAILED");
    console.log(err);

    await updateUploadStatus(job.id, "failed");
    throw err;
  }
}

export const normalizeFile = (file: any) => ({
  name: file.name,
  uri: file.uri,
  size: file.size,
  type: file.mimeType || file.type,
});



