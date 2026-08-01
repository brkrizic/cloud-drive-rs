export type UploadJob = {
  id: string;

  // S3
  uploadId?: string | null; // only for multipart
  s3Key?: string | null;

  // File info
  fileName: string;
  fileUri: string;
  fileSize: number;
  contentType: string;

  // Optional preview
  thumbnailUri?: string | null;
  thumbnailSize?: number | null;

  // Upload config
  uploadType: "single" | "multipart";
  uploadUrl?: string | null; // only for single
  parts?: UploadPart[];

  // State
  status: "pending" | "uploading" | "failed" | "completed" | "canceled";
  progress: number; // 0 → 1 (use float)

  // Metadata
  createdAt: number;
  error?: string;

  // Flags
  notified: 0 | 1;
  locked: 0 | 1;

  // Mode
  mode: "background" | "direct";

  // Extra app data
  isText?: boolean;
  title?: string;
  description?: string;

  // Optional direction (future use)
  direction?: "upload" | "download";
};

export type UploadPart = {
  id?: number;

  jobId: string;
  uploadId: string;

  partNumber: number;
  url?: string;

  etag?: string | null;

  status: "pending" | "uploading" | "uploaded" | "failed";

  // Optional (for better progress calculation)
  size?: number;
};

export type UploadContextType = {
  job: UploadJob;
  sourceFile: {
    uri: string;
    type: string;
    size: number;
    name: string;
  };
}