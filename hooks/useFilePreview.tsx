import { useState } from 'react';
import { Directory, File, Paths } from 'expo-file-system';
import RNFetchBlob from 'react-native-blob-util';
import { useDownloadUrl } from './useDownloadUrl';

type PreviewFile = {
  fileId: string;
  key: string;
  fileName: string;
};

export function useFilePreview() {
  const { fetchDownloadUrl } = useDownloadUrl();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getCachedPath = (file: PreviewFile) => {
    const cacheDir = new Directory(Paths.cache, 'previews');
    const fileObj = new File(cacheDir, `${file.fileId}_${file.fileName}`);
    return { cacheDir, fileObj };
  };

  const getPreviewUri = async (file: PreviewFile): Promise<string> => {
    if (!file?.fileId || !file?.key) {
      throw new Error('Invalid file object');
    }

    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      const { cacheDir, fileObj } = getCachedPath(file);

      // await cacheDir.create({ intermediates: true }).catch(() => {});

      // 1️⃣ Check cache
      const info = await fileObj.info();
      if (info.exists && info.size && info.size > 0) {
        setLoading(false);
        return fileObj.uri;
      }

      // 2️⃣ Remove corrupted file
      if (info.exists && (!info.size || info.size === 0)) {
        return fileObj.uri;
      }

      // 3️⃣ Download
      const downloadUrl = await fetchDownloadUrl(file.key);

      const targetPath = fileObj.uri.replace('file://', '');

      console.log(downloadUrl);

      await RNFetchBlob
        .config({
          path: targetPath,
          fileCache: true,
        })
        .fetch('GET', downloadUrl)
        .progress({ interval: 100 }, (received, total) => {
          if (!total) return;
          const percent = Math.round((received / total) * 100);
          setProgress(percent);
        });

      // 4️⃣ Validate
      const finalInfo = await fileObj.info();
      if (!finalInfo.exists || !finalInfo.size || finalInfo.size === 0) {
        throw new Error('Failed to download file');
      }

      setProgress(100);
      setLoading(false);

      return fileObj.uri;

    } catch (err: any) {
      setError(err.message || 'Download failed');
      setLoading(false);
      throw err;
    }
  };

  return {
    getPreviewUri,
    loading,
    progress,
    error,
  };
}
