import { File } from "./file";
import { Folder } from "./folder";

export type UploadStatus =
  | "pending"
  | "uploading"
  | "completed"
  | "failed"
  | "canceled";

export type FileItem = {
  type: "file";

  fileId: string;
  key: string;

  fileName: string;
  contentType?: string;
  fileSize?: number;

  thumbnailKey?: string;

  lastViewedBy?: string;
  lastViewed?: number;

  uploadedAt?: number;


  // upload state
  isUploading?: boolean;

  uploadStatus?: 
    | "pending"
    | "uploading"
    | "completed"
    | "failed"
    | "canceled";

  uploadProgress?: number;
};

export type FolderItem = {
  type: "folder";
  folderId: string;
  folderName: string;
  createdAt: string;
};

export type ExplorerItem =
  | FileItem
  | FolderItem;