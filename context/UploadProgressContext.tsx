import { createContext, useContext, useState, ReactNode } from "react";

type UploadProgressContextType = {
  progressMap: Record<string, number>;
  setProgress: (jobId: string, progress: number) => void;
  clearProgress: (jobId: string) => void;
};

const UploadProgressContext = createContext<UploadProgressContextType>(null!);

export function UploadProgressProvider({ children }: { children: ReactNode }) {
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const setProgress = (jobId: string, progress: number) => {
    setProgressMap(prev => ({
      ...prev,
      [jobId]: progress,
    }));
  };

  const clearProgress = (jobId: string) => {
    setProgressMap(prev => {
      const copy = { ...prev };
      delete copy[jobId];
      return copy;
    });
  };

  return (
    <UploadProgressContext.Provider value={{
      progressMap,
      setProgress,
      clearProgress
    }}>
      {children}
    </UploadProgressContext.Provider>
  );
}

export const useUploadProgress = () => useContext(UploadProgressContext);