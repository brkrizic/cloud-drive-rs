import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useFilesQueryKey } from "hooks/useFilesQueryKey";

import {
  createFolder,
  deleteFolder,
  getFolderContents,
  renameFolder,
} from "services/fileService";
import { createFolderLocally, deleteFolderLocally } from "services/local/folderLocalService";

/* -----------------------------------
   📁 CREATE FOLDER
----------------------------------- */
export function useCreateFolder(currentFolderId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = useFilesQueryKey();

  return useMutation({
    mutationFn: async (data) => {
      console.log("🚀 MUTATION START: createFolderLocally", data);

      const result = await createFolderLocally(data);

      console.log("✅ MUTATION SUCCESS:", result);

      return result;
    },

    onError: (err) => {
      console.log("❌ MUTATION ERROR:", err);
    },

    onSuccess: () => {
      console.log("🔄 invalidating query:", queryKey);

      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
}

/* -----------------------------------
   📂 GET FOLDER CONTENTS (PAGINATED)
----------------------------------- */
export const useFolderContents = (parentFolderId: string | null) => {
  return useInfiniteQuery({
    queryKey: ["folderContents", parentFolderId ?? null],

    queryFn: ({ pageParam = null }) =>
      getFolderContents({
        parentFolderId,
        lastKey: pageParam,
        limit: 20,
      }),

    getNextPageParam: (lastPage) => {
      return lastPage?.lastKey ?? undefined;
    },

    // optional but VERY useful for UX
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

/* -----------------------------------
   🗑 DELETE FOLDER
----------------------------------- */
export function useDeleteFolder(currentFolderId: string | null) {
  const queryClient = useQueryClient();

  const queryKey = useFilesQueryKey();

  return useMutation({
    mutationFn: deleteFolderLocally,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
    },
  });
}

/* -----------------------------------
   ✏️ RENAME FOLDER
----------------------------------- */
export function useRenameFolder(currentFolderId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renameFolder,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["folderContents", currentFolderId ?? null],
      });
    },
  });
}