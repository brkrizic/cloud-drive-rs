// hooks/useDeleteFile.ts
import { fetchAuthSession } from "aws-amplify/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFilesQueryKey } from "../useFilesQueryKey";
import { deleteFile } from "services/fileService";

export function useDeleteFile(queryKey: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => deleteFile(fileId),

    onMutate: async (fileId) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.filter(
              (f: any) => f.fileId !== fileId
            ),
          })),
        };
      });

      return { previousData };
    },

    onError: (_err, _fileId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}