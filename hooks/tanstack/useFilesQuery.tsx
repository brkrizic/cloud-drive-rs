import { useInfiniteQuery } from '@tanstack/react-query';
import { useFileQuery } from 'context/FileQueryContext';
import { FileItem } from 'constants/fileItem';
import { useFilesQueryKey } from '../useFilesQueryKey';
import { fetchFiles } from 'services/fileService';
import { User } from 'constants/user';
import { upsertFiles } from 'database/fileRepo';
import { upsertFolders } from 'database/folderRepo';
import { runDbWrite } from 'database/dbService';


export type FilesResponse = {
  items: FileItem[];
  lastKey: string | null;
  user: User
};

export const useFilesQuery = () => {
  const queryKey = useFilesQueryKey();

  return useInfiniteQuery<FilesResponse>({
    queryKey,

    initialPageParam: undefined,

    queryFn: async ({ pageParam }) => 
      await fetchFiles({
        lastKey: pageParam,
        limit: 20,
      }),

    getNextPageParam: (lastPage) => lastPage.lastKey ?? undefined,

    staleTime: 0,
    refetchOnMount: "always",
    retry: 2,
  });
};