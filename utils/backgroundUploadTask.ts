import BackgroundService from 'react-native-background-actions';
import { uploadMultipartFile, uploadSingleFile } from './uploadHelper';
import { 
  deleteUploadJob, 
  getAllUploads, 
  getAndLockNextJob, 
  getNextPendingJob, 
  updateUploadProgress, 
  updateUploadStatus 
} from 'database/uploadRepo';
import { showMessage } from 'react-native-flash-message';
import { formatDate } from './formateDate';
import { queryClient } from 'App';
import { UploadJob } from 'constants/job';

let isUploading = false;

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const backgroundUploadTask = async (
  onComplete?: () => void,
) => {
  if (isUploading) return;
  isUploading = true;

  try {
    await sleep(2000);
    while (true) {
      console.log('[BackgroundUpload] Checking for next job...');
      await sleep(2000);
      const job: UploadJob | null = await getAndLockNextJob();

      // ✅ ALWAYS FIRST CHECK
      if (!job) {
        console.log("[BackgroundUpload] No jobs → stopping worker");
        await BackgroundService.stop();
        onComplete?.();
        break;
      }

      if (job.status === "canceled") {
        continue;
      }

      console.log("START TASK", Date.now());
      console.log('[BackgroundUpload] Job found:', job.id);

      // ✅ SAFE query update
      queryClient.setQueryData<UploadJob[]>(["uploads"], (old = []) => {
        const exists = old.some(j => j.id === job.id);

        if (!exists) {
          return [...old, { ...job, status: "uploading", progress: 0 }];
        }

        return old.map(j =>
          j.id === job.id
            ? { ...j, status: "uploading", progress: 0 }
            : j
        );
      });

      try {

        if (job.uploadType === "multipart") {
          await uploadMultipartFile(job);
        } else {
          await uploadSingleFile(job);
        }

        await updateUploadProgress(job.id, 100);
        await updateUploadStatus(job.id, "completed");

        queryClient.setQueryData<UploadJob[]>(["uploads"], (old = []) =>
          old.map(j =>
            j.id === job.id
              ? { ...j, status: "completed", progress: 100 }
              : j
          )
        );

      } catch (err) {
        console.error("Upload failed", job.id, err);

        await updateUploadStatus(job.id, "failed");

        queryClient.setQueryData<UploadJob[]>(["uploads"], (old = []) =>
          old.map(j =>
            j.id === job.id
              ? { ...j, status: "failed" }
              : j
          )
        );
      }
    }
  } finally {
    isUploading = false;
  }
};

export const options = {
  taskName: 'UploadTask',
  taskTitle: 'Uploading file...',
  taskDesc: 'Your files are being uploaded',
  taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: '',
  parameters: {
      delay: 1000,
  },
};
