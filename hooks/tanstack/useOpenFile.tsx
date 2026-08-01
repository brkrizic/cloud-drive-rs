import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFilesQueryKey } from "hooks/useFilesQueryKey";
import { getFile } from "services/fileService";

export function useOpenFile() {
  const queryClient = useQueryClient();
  const filesQueryKey = useFilesQueryKey();

  return useMutation({
    mutationFn: (fileId: string) => getFile(fileId),

    onSuccess: (data, fileId) => {
      // 1. update single file cache
      queryClient.setQueryData(["file", fileId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          lastViewedAt: Date.now(),
          lastViewedBy: "self",
        };
      });

      // 2. update list cache using SAME key system
      queryClient.invalidateQueries({
        queryKey: filesQueryKey,
      });
    },
  });
}