import { useFileQuery } from "context/FileQueryContext";
import { useMemo } from "react";

export const useFilesQueryKey = () => {
  const { sortMode, filterTypes, searchText } = useFileQuery();

  return useMemo(
    () => ["files", sortMode, filterTypes, searchText],
    [sortMode, filterTypes, searchText]
  );
};