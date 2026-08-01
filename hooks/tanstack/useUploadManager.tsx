import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadJob } from "constants/job";
import { createUploadJob, saveUploadParts } from "database/uploadRepo";
import { useCallback } from "react";
import { getMultipartUploadUrls, getSingleUploadUrl, saveMetadata } from "services/fileService";
import { startBackgroundWorker } from "utils/backgroundWorker";

const MULTIPART_THRESHOLD = 100 * 1024 * 1024; // 100MB

type UploadContext = {
  onOpenSheet: () => void;
};

export function useUploadFile({
  onOpenSheet,
}: UploadContext & { onOpenSheet?: () => void }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (job: UploadJob) => {

      const jobWithMode: UploadJob = {
        ...job,
        mode: "background",
      };

      const isMultipart = job.fileSize > MULTIPART_THRESHOLD;
      
      // -------------------------
      // MULTIPART
      // -------------------------
      if (isMultipart) {
        console.log("Starting Multipart Upload...");
        const res = await getMultipartUploadUrls({
          fileName: job.fileName,
          fileSize: job.fileSize,
          contentType: job.contentType,
        });

        console.log(res);

        const data = res.data;

        const multipartJob: UploadJob = {
          ...jobWithMode,
          uploadType: "multipart",
          uploadId: data.uploadId,
          s3Key: data.key,
          status: "pending",
          progress: 0,
          parts: data.parts.map((p: any) => ({
            jobId: job.id,
            uploadId: data.uploadId,
            partNumber: p.partNumber,
            url: p.url,
            status: "pending",
          })),
        };

        await createUploadJob(multipartJob);
        await saveUploadParts(multipartJob.parts);

        const payload = {
          uploadId: multipartJob.uploadId,  
          key: multipartJob.s3Key,                     
          fileName: multipartJob.fileName,
          fileSize: multipartJob.fileSize,
          contentType: multipartJob.contentType,
          thumbnailKey: multipartJob.thumbnailUri,   
        };

        await saveMetadata(payload);

        return multipartJob;
      }

      // -------------------------
      // SINGLE
      // -------------------------
      console.log("Starting Single Upload...");

      console.log(job.contentType);
      console.log("Job before uploading:", job);

      const data = await getSingleUploadUrl({
        fileName: job.fileName,
        fileSize: job.fileSize,
        contentType: job.contentType,
      });

      const singleJob: UploadJob = {
        ...jobWithMode,
        uploadType: "single",
        uploadUrl: data.uploadUrl,
        s3Key: data.key,
      };

      await createUploadJob(singleJob);

      const payload = {
        uploadId: singleJob.uploadId || singleJob.id,
        key: singleJob.s3Key,
        fileName: singleJob.fileName,
        fileSize: singleJob.fileSize,
        contentType: singleJob.contentType,
        thumbnailKey: singleJob.thumbnailUri,
      };

      await saveMetadata(payload);

      return singleJob;
    },
    onSuccess: async (job) => {
      console.log("🟢 Job saved, starting worker...");
      if (job.mode === "background") {
        console.log("Waiting for background worker...");
        startBackgroundWorker(); // ❗ DO NOT await
      }
    },

    onMutate: async (job: UploadJob) => {
      // optional: cancel queries if needed
      await queryClient.cancelQueries();

      // optional UI side effects
      onOpenSheet?.();

      return { job };
    },

    onError: (error: any, job: UploadJob, context: any) => {
      console.error("Upload failed:", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });
  // SINGLE UPLOAD
  const uploadFile = useCallback(
    (job: UploadJob) => {
      mutation.mutate(job);
    },
    [mutation]
  );

  // BATCH
  const uploadFiles = useCallback(
    async (jobs: UploadJob[]) => {
      for (const job of jobs) {
        await mutation.mutateAsync(job);
      }
    },
    [mutation]
  );

  return {
    uploadFile,
    uploadFiles,
    isUploading: mutation.isPending,
    error: mutation.error,
  };
}