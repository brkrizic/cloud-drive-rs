import { useEffect, useState } from "react";
import { getAllUploads } from "database/uploadRepo";
import { Job } from "constants/job";

export function useUploadHistory() {
  const [historyJobs, setHistoryJobs] = useState<Job[]>([]);

  const fetchHistory = async () => {
    try {
      const allJobs = await getAllUploads();
      // Filter out uploading jobs, we leave them for reactive context
      const filtered = allJobs.filter(job => job.status !== "uploading");
      setHistoryJobs(filtered);
    } catch (err) {
      console.error("Failed to fetch upload history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return { historyJobs, refreshHistory: fetchHistory };
}