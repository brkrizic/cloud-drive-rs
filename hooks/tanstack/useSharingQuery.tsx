import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSharedWithMe,
  getSharedByMe,
  shareFile,
  revokeShare,
  checkFileAccess,
} from "services/fileService";

//
// =========================
// 📥 SHARED WITH ME
// =========================
//

export const useSharedWithMe = () => {
  return useQuery({
    queryKey: ["sharedWithMe"],
    queryFn: getSharedWithMe,
    refetchOnWindowFocus: false,
  });
};

//
// =========================
// 📤 SHARED BY ME
// =========================
//

export const useSharedByMe = () => {
  return useQuery({
    queryKey: ["sharedByMe"],
    queryFn: getSharedByMe,
    refetchOnWindowFocus: false,
  });
};

//
// =========================
// 🔄 SHARE FILE
// =========================
//

export const useShareFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shareFile,

    onSuccess: () => {
      // refresh both lists
      queryClient.invalidateQueries({ queryKey: ["sharedWithMe"] });
      queryClient.invalidateQueries({ queryKey: ["sharedByMe"] });
    },
  });
};