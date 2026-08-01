// utils/query.ts
export const getFilesKey = ({
  sortMode,
  filterTypes,
  searchText
}: {
  sortMode: string | null;
  filterTypes: string[];
  searchText: string;
}) => {
  return ["files", sortMode, [...filterTypes].sort(), searchText];
};