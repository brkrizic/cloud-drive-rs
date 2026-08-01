import React, { useEffect, useState } from "react";
import {
  Image,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useDownloadUrl } from "hooks/useDownloadUrl";
import { FileItem } from "constants/fileItem";

type Props = {
  item: FileItem;
  size: number;
  backgroundColor: string;
  onPress?: () => void;
};

function GalleryItem({
  item,
  size,
  backgroundColor,
  onPress,
}: Props) {
  const { fetchDownloadUrl } = useDownloadUrl();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadThumbnail() {
      if (!item.thumbnailKey) {
        setLoading(false);
        return;
      }

      try {
        const url = await fetchDownloadUrl(item.thumbnailKey);
        if (mounted) setImageUrl(url);
      } catch (e) {
        console.error("Thumbnail error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadThumbnail();

    return () => {
      mounted = false;
    };
  }, [item.thumbnailKey]);


  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.item,
        { width: size, height: size, backgroundColor },
      ]}
    >
      {loading && (
        <ActivityIndicator size="small" color="#999" />
      )}

      {!loading && imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      )}

      {/* <View style={styles.overlay}>
        <Text numberOfLines={1} style={styles.filename}>
          {item.fileName}
        </Text>
      </View> */}
    </TouchableOpacity>
  );
}

export default React.memo(GalleryItem);

const styles = StyleSheet.create({
  item: {
    borderRadius: 0,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  filename: {
    fontSize: 11,
    color: "#fff",
  },
});
