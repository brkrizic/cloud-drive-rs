import { api } from "handlers/apiClient";
import { Alert } from "react-native";
import { FilesResponse } from "hooks/tanstack/useFilesQuery";

//
// =========================
// USER
// =========================
//

export const deleteUserAccount = async () => {
  return new Promise((resolve) => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve({ success: false }) },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.post("/stashr/v1/users/delete", {});
              resolve({ success: true, data: res.data });
            } catch (error) {
              resolve({
                success: false,
                message: error || "Failed to delete account",
              });
            }
          },
        },
      ]
    );
  });
};

//
// =========================
// FILES
// =========================
//

export const fetchFiles = async ({
  lastKey,
  limit = 20,
  filterTypes = [],
  searchText = "",
}: {
  lastKey?: string | null;
  limit?: number;
  filterTypes?: string[];
  searchText?: string;
}): Promise<FilesResponse> => {
  const res = await api.get("/stashr/v1/files", {
    params: {
      lastKey,
      limit,
      filterTypes: filterTypes.join(","),
      search: searchText,
    },
  });

  return {
    items: res.data?.items ?? [],
    lastKey: res.data?.lastKey ?? null,
    user: res.data?.user ?? null,
  };
};

export const deleteFile = async (fileId: string) => {
  const res = await api.post("/stashr/v1/files/delete", {
    fileId,
  });

  return res.data;
};

export const getDownloadUrl = async (fileId: string): Promise<string> => {
  const res = await api.get("/stashr/v1/files/download", {
    params: { fileId },
  });

  return res.data.url;
};

export const getFile = async (fileId: string) => {
  const res = await api.get("/stashr/v1/files/get", {
    params: { fileId },
  });

  return res.data;
};

//
// =========================
// UPLOADS
// =========================
//

export const getSingleUploadUrl = async (data: {
  fileName: string;
  contentType?: string;
  fileSize: number;
}) => {
  const res = await api.post("/stashr/v1/uploads/url", data);
  return res.data;
};

export const getMultipartUploadUrls = async (data: {
  fileName: string;
  fileSize: number;
  contentType: string;
}) => {
  const res = await api.post("/stashr/v1/uploads/multipart/init", data);
  return res;
};

export const completeMultipartUpload = async (data: {
  uploadId: string;
  key: string;
  parts: any;
}) => {
  const res = await api.post("/stashr/v1/uploads/multipart/complete", data);
  return res;
};

export const saveMetadata = async (data: {
  uploadId: string;
  key: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  thumbnailKey?: string;
}) => {
  const res = await api.post("/stashr/v1/files/save", data);
  return res.data;
};

//
// =========================
// FOLDERS
// =========================
//

export const createFolder = async (data: {
  folderId: string;
  folderName: string;
  parentFolderId: string | null;
}) => {
  const res = await api.post("/stashr/v1/folders/create", data);
  console.log(res.data);
  return res.data;
};

export const getFolderContents = async ({
  parentFolderId,
  lastKey,
  limit = 20,
}: {
  parentFolderId: string | null;
  lastKey?: string | null;
  limit?: number;
}) => {
  const res = await api.post("/stashr/v1/folders/contents", {
    parentFolderId,
    lastKey,
    limit,
  });

  return res.data;
};

export const deleteFolder = async (folderId: string) => {
  const res = await api.post("/stashr/v1/folders/delete", folderId);
  return res.data;
};
// TODO: Test function
export const renameFolder = async (data: {
  folderId: string;
  name: string;
}) => {
  const res = await api.post("/stashr/v1/folders/rename", data);
  return res.data;
};

//
// =========================
// SHARING
// =========================
//

// Share a file with another user
export const shareFile = async (data: {
  fileId: string;
  sharedWithUserId: string;
}) => {
  const res = await api.post("/stashr/v1/sharing/share", data);
  return res.data;
};

// Get files shared with me (received)
export const getSharedWithMe = async () => {
  const res = await api.get("/stashr/v1/sharing/received");
  return res.data;
};

// Get files I shared (sent)
export const getSharedByMe = async () => {
  const res = await api.get("/stashr/v1/sharing/sent");
  return res.data;
};

//TODO: Not Implemented Lmabda for this
// Revoke access to a shared file
export const revokeShare = async (shareId: string) => {
  const res = await api.post("/stashr/v1/sharing/revoke", {
    shareId,
  });
  return res.data;
};

//TODO: Not Implemented Lmabda for this
// Check if user has access to a file (important for security)
export const checkFileAccess = async (fileId: string) => {
  const res = await api.get("/stashr/v1/sharing/access", {
    params: { fileId },
  });
  return res.data;
};