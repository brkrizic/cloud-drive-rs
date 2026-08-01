import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import GalleryItem from "components/GalleryItem";
import { FileItem } from "constants/fileItem";
import GalleryPreview from "components/GalleryPreview";


type GalleryScreenProps = {
  files: FileItem[];
  onOpenFile?: (file: FileItem) => void;
  loading: boolean;
  loadFiles: (nextPage?: boolean) => Promise<void>;
  loadingMore: boolean;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 3;
const GAP = 2;
const ITEM_SIZE = (SCREEN_WIDTH - GAP * (NUM_COLUMNS + 15)) / NUM_COLUMNS;

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];



export default function GalleryScreen({
  files,
  loadFiles,
  loading,
  loadingMore,
  onOpenFile,
}: GalleryScreenProps) {
  const { theme } = useSettings();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);


  const openAtIndex = (index: number) => {
    setActiveIndex(index);
    setVisible(true);
  };

  const bg =
    theme === "dark" ? colors.background : colors.backgroundLight;
  const card =
    theme === "dark" ? colors.card : colors.cardLight;
  const textSecondary =
    theme === "dark"
      ? colors.textSecondary
      : colors.textSecondaryLight;
  const textPrimary =
          theme === "dark" ? colors.textPrimary : colors.textPrimaryLight;
  const accent = theme === "dark" ? colors.accent : colors.accentLight;

  // ✅ Only images WITH thumbnails
  const images = useMemo(
    () =>
      files.filter((f) => {
        if (!f.thumbnailKey) return false;
        const ext = f.fileName.split(".").pop()?.toLowerCase();
        return ext && IMAGE_EXTENSIONS.includes(ext);
      }),
    [files]
  );

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  const viewableItems = useRef<{ [key: string]: boolean }>({});

  const onViewableItemsChanged = useCallback(({ viewableItems: items }) => {
    items.forEach(item => {
      viewableItems.current[item.item.key] = true; // Mark thumbnail as visible
    });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: FileItem; index: number }) => (
      <GalleryItem
        item={item}
        size={ITEM_SIZE}
        backgroundColor={card}
        onPress={() => openAtIndex(index)}
      />
    ),
    [card]
  );

  const getItemLayout = useCallback(
    (_: FileItem[], index: number) => ({
      length: ITEM_SIZE + GAP,
      offset: (ITEM_SIZE + GAP) * index,
      index,
    }),
    []
  );


  if (images.length === 0) {
    return (
      <SafeAreaView style={[styles.empty, { backgroundColor: bg }]}>
        <Ionicons name="images-outline" size={48} color={textSecondary} />
        <Text style={[styles.emptyText, { color: textSecondary }]}>
          No images uploaded yet
        </Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.empty, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={accent} />
      </SafeAreaView>
    );
  }



  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="image-outline" size={26} color={accent} />
        <Text style={[styles.headerTitle, { color: textPrimary }]}>
          Gallery
        </Text>
      </View>
      
      <FlatList
        data={images}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ padding: GAP }}
        columnWrapperStyle={{ gap: GAP }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        onEndReached={() => {
          if(!loadingMore) loadFiles(true);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loadingMore ? (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <ActivityIndicator size="small" color={accent} />
            </View>
          ) : null
        }
      />

      {activeIndex !== null && (
        <GalleryPreview
          files={images}
          initialIndex={activeIndex}
          visible={visible}
          setVisible={setVisible}
        />
      )}

      
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  
});

