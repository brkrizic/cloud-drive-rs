import { createContext, useContext, useState, ReactNode } from "react";
import { Job } from "constants/job";

interface DownloadContextType {
  downloads: Job[];
  setDownloads: React.Dispatch<React.SetStateAction<Job[]>>;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const DownloadProvider = ({ children }: { children: ReactNode }) => {
  const [downloads, setDownloads] = useState<Job[]>([]);

  return (
    <DownloadContext.Provider value={{ downloads, setDownloads }}>
      {children}
    </DownloadContext.Provider>
  );
};

// Custom hook for convenience
export const useDownloads = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error("useDownloads must be used within an UploadProvider");
  }
  return context;
};
