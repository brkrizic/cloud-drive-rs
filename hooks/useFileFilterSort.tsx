import { FileItem } from 'constants/fileItem';
import { Job } from 'constants/job';
import { useMemo, useState } from 'react';

// sorting
export type SortMode =
  | 'AZ'
  | 'ZA'
  | 'SIZE_UP'
  | 'SIZE_DOWN'
  | 'DATE_UP'
  | 'DATE_DOWN';

// filters
export type FileFilters = {
  photos: boolean;
  videos: boolean;
  audio: boolean;
  documents: boolean;
  largeFiles: boolean;
  thisWeek: boolean;
};

const LARGE_FILE_BYTES = 50 * 1024 * 1024; // 50MB
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const isPhoto = (f: FileItem) => f.contentType?.startsWith('image/');
const isVideo = (f: FileItem) => f.contentType?.startsWith('video/');
const isAudio = (f: FileItem) => f.contentType?.startsWith('audio/');
const isDocument = (f: FileItem) =>
  f.contentType?.includes('pdf') ||
  f.contentType?.includes('word') ||
  f.contentType?.includes('officedocument');

const isLarge = (f: FileItem) => f.fileSize >= LARGE_FILE_BYTES;
const isThisWeek = (f: FileItem) =>
  new Date(f.uploadedAt).getTime() >= Date.now() - ONE_WEEK_MS;


const sortMap: Record<SortMode, (a: FileItem, b: FileItem) => number> = {
  AZ: (a, b) => a.fileName.localeCompare(b.fileName),
  ZA: (a, b) => b.fileName.localeCompare(a.fileName),

  SIZE_UP: (a, b) => a.fileSize - b.fileSize,
  SIZE_DOWN: (a, b) => b.fileSize - a.fileSize,

  DATE_UP: (a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime(),
  DATE_DOWN: (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
};

export function useFileFilterSort(files: FileItem[]) {
  const [sortMode, setSortMode] = useState<SortMode>('AZ');

  const [filters, setFilters] = useState<FileFilters>({
    photos: false,
    videos: false,
    audio: false,
    documents: false,
    largeFiles: false,
    thisWeek: false,
  });

  const visibleFiles = useMemo(() => {
    let result = [...files];

    // ----- TYPE FILTERS -----
    const typeFiltersActive =
      filters.photos ||
      filters.videos ||
      filters.audio ||
      filters.documents;

    if (typeFiltersActive) {
      result = result.filter(file => {
        if (filters.photos && isPhoto(file)) return true;
        if (filters.videos && isVideo(file)) return true;
        if (filters.audio && isAudio(file)) return true;
        if (filters.documents && isDocument(file)) return true;
        return false;
      });
    }

    // ----- OTHER FILTERS -----
    if (filters.largeFiles) {
      result = result.filter(isLarge);
    }

    if (filters.thisWeek) {
      result = result.filter(isThisWeek);
    }

    // ----- SORT -----
    result.sort(sortMap[sortMode]);

    return result;
  }, [files, filters, sortMode]);

  return {
    visibleFiles,

    // state
    sortMode,
    filters,

    // setters
    setSortMode,
    setFilters,

    // helpers (nice UX)
    toggleFilter: (key: keyof FileFilters) =>
      setFilters(prev => ({ ...prev, [key]: !prev[key] })),

    resetFilters: () =>
      setFilters({
        photos: false,
        videos: false,
        audio: false,
        documents: false,
        largeFiles: false,
        thisWeek: false,
      }),
  };
}