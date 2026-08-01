import { FileItem } from "constants/fileItem";
import { Job } from "constants/job";

  export const formatSize = (bytes?: number) => {
      if (!bytes) return "Unknown";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
      if (bytes < 1024 * 1024 * 1024)
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

export const jobToFileItem = (job: Job): FileItem => ({
  key: job.s3Key,
  fileName: job.fileName,
  fileSize: job.fileSize ?? 0,
  contentType: job.contentType,
  uploadedAt: job.createdAt,

  uploading: job.status !== "completed",
  progress: job.progress,
});