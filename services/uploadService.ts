import * as FileSystem from "expo-file-system/legacy";
import { v4 as uuidv4 } from "uuid";
import { generateThumbnail } from "../utils/thumbnailGenerator";
import { UploadJob } from "constants/job";
import { getSingleUploadUrl } from "./fileService";


export const prepareUploadJob = async (file: {
  name: string;
  uri: string;
  size: number;
  type?: string;
}) => {
    const permanentUri = FileSystem.documentDirectory + file.name;

    await FileSystem.copyAsync({
        from: file.uri,
        to: permanentUri,
    });

    if (!file.type) {
        throw new Error("File type not recognized");
    }

    if (!file.size || file.size <= 0) {
        throw new Error("Invalid file size");
    }

    const thumbnailUri = await generateThumbnail({
        uri: permanentUri,
        type: file.type,
    });

    console.log("FILE: ", file);
    console.log("Permanent URI: ", permanentUri);

    const normalizePath = (uri: string) =>
        uri.startsWith("file://") ? uri.replace("file://", "") : uri;

    const cleanPermanentUri = normalizePath(permanentUri);

    const job: UploadJob = {
        id: uuidv4(),

        fileName: file.name,
        fileUri: cleanPermanentUri,
        thumbnailUri,

        fileSize: file.size,
        contentType: file.type,

        // Upload config (decided later)
        uploadType: "single",
        uploadId: null,
        uploadUrl: null,
        s3Key: null,

        // State
        status: "pending",
        progress: 0,

        // Flags
        notified: 0,
        locked: 0,
        mode: "background",

        createdAt: Date.now(),
    };

    console.log("INITIAL PICKED JOB INFO: ", job);

    return job;
};