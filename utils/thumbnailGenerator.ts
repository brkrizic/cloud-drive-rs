import ImageResizer from "react-native-image-resizer";
import { createThumbnail } from "react-native-create-thumbnail";

/* -------- TYPES -------- */

type PickedFile = {
  uri: string;
  type: string; // mime type
};

/* -------- HOOK -------- */


  export const generateImageThumbnail = async (uri: string) => {
    const image = await ImageResizer.createResizedImage(
      uri,
      300,
      300,
      "JPEG",
      60
    );

    return image.uri;
  };

  /* ---------- VIDEO ---------- */
  export const generateVideoThumbnail = async (uri: string) => {
    const thumbnail = await createThumbnail({
      url: uri,
      timeStamp: 1000,
    });

    return thumbnail.path;
  };

  /* ---------- PUBLIC ---------- */
  export const generateThumbnail = async ({ uri, type }: PickedFile): Promise<string | null> => {
    if (!uri || !type) return null;

    if (type.startsWith("image/")) {
      return generateImageThumbnail(uri);
    }

    if (type.startsWith("video/")) {
      return generateVideoThumbnail(uri);
    }

    return null; // PDFs, docs, etc.
  };