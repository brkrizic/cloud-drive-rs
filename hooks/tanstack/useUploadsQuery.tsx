import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "App";
import { UploadJob } from "constants/job";
import { clearAllUploads, getAllUploads } from "database/uploadRepo";

export function useUploadsQuery() {
  return useQuery({
    queryKey: ["uploads"],
    queryFn: async () => {
      const data = await getAllUploads();
      return data ?? [];
    },
    staleTime: 1000 * 5, // 5s (tweak later)
    refetchOnWindowFocus: false,
  });
};

export function useClearUploads() {
  return useMutation({
    mutationFn: clearAllUploads,

    onSuccess: () => {
      // instantly clear UI cache
      queryClient.setQueryData<UploadJob[]>(["uploads"], []);
    },

    onError: (err) => {
      console.error("Clear uploads failed:", err);
    },
  });
}