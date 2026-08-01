import { FileItem } from "constants/fileItem";
import { Job } from "constants/job";
import { updateUploadProgress, updateUploadStatus } from "database/uploadRepo";

// export function uploadFileToS3(
//   uploadUrl: string,
//   fileUri: string,
//   contentType: string,
//   onProgress?: (percent: number) => void
// ) {
//   return new Promise<void>(async (resolve, reject) => {
//     try {
//       const blob = await fetch(fileUri).then(r => r.blob());

//       const xhr = new XMLHttpRequest();
//       xhr.open("PUT", uploadUrl);
//       xhr.setRequestHeader("Content-Type", contentType);

//       xhr.upload.onprogress = (event) => {
//         if (onProgress && event.lengthComputable) {
//           onProgress(Math.round((event.loaded / event.total) * 100));
//         }
//       };

//       xhr.onload = () => {
//         if (xhr.status >= 200 && xhr.status < 300) {
//           resolve();
//         } else {
//           reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.responseText}`));
//         }
//       };

//       xhr.onerror = () => reject(new Error("Network error during upload"));

//       xhr.send(blob); // ✅ must be Blob, not object
//     } catch (err) {
//       reject(err);
//     }
//   });
// }

export const uploadToS3 = async (file: any, job: Job, onProgress?: (progress: number) => void) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const blob = await fetch(file.uri).then(r => r.blob());

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", job.uploadUrl);
      xhr.setRequestHeader("Content-Type", file.mimeType || "application/octet-stream");


      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          await updateUploadStatus(job.id, "done");
          await updateUploadProgress(job.id, 100);
          resolve();
        } else {
          await updateUploadStatus(job.id, "error");
          reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.responseText}`));
        }
      };

      xhr.onerror = async () => {
        await updateUploadStatus(job.id, "error");
        reject(new Error("Network error during upload"));
      };

      xhr.send(blob);
    } catch (err) {
      await updateUploadStatus(job.id, "error");
      reject(err);
    }
  });
};


