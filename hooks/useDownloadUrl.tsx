import { useCallback } from "react";
import { getDownloadUrl } from "services/fileService";


export function useDownloadUrl() {
  const fetchDownloadUrl = useCallback(async (key: string) => {
    return await getDownloadUrl(key);
  }, []);

  return { fetchDownloadUrl };
}