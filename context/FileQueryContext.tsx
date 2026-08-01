import React, { createContext, useContext, useState, useMemo } from 'react';
import { SortMode } from 'hooks/useFileFilterSort';

type FileQueryContextType = {
  sortMode: SortMode | null;
  filterTypes: string[];
  searchText: string;

  setSortMode: (mode: SortMode | null) => void;
  toggleFilter: (type: string) => void;
  setSearchText: (text: string) => void;
  resetFilters: () => void;

  // queryKey: (string | string[])[];
};

const FileQueryContext = createContext<FileQueryContextType | undefined>(undefined);

export const FileQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sortMode, setSortMode] = useState<SortMode | null>('AZ');
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  const toggleFilter = (type: string) => {
    setFilterTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const resetFilters = () => {
    setSortMode(null);
    setFilterTypes([]);
    setSearchText('');
  };

  return (
    <FileQueryContext.Provider
      value={{
        sortMode,
        filterTypes,
        searchText,
        setSortMode,
        toggleFilter,
        setSearchText,
        resetFilters,
      }}
    >
      {children}
    </FileQueryContext.Provider>
  );
};

export const useFileQuery = () => {
  const context = useContext(FileQueryContext);
  if (!context) throw new Error('useFileQuery must be used inside FileQueryProvider');
  return context;
};