import ImageResizer from "react-native-image-resizer";
import { createThumbnail } from "react-native-create-thumbnail";

export const generateImageThumbnail = async (uri: string) => {
  const resized = await ImageResizer.createResizedImage(
    uri,
    300,
    300,
    "JPEG",
    60
  );

  return resized.uri;
};

export const generateVideoThumbnail = async (uri: string) => {
  const thumbnail = await createThumbnail({
    url: uri,
    timeStamp: 1000, // 1 second mark
  });

  return thumbnail.path;
};