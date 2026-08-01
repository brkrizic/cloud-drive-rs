import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";

import { useDeleteFolder, useFolderContents } from "hooks/tanstack/useFolderQuery";
import { FileRow } from "components/FileRow";
import { FileGrid } from "components/FileGrid";
import AnimatedLoadingIcon from "components/AnimatedLoadingIcon";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "components/Avatar";
import Header from "components/Header";
import FolderHeader from "components/FolderHeader";

/* -----------------------------------
   📁 FOLDER CARD (CLEAN UI)
----------------------------------- */
const FolderItem = ({ item, onPress, onDelete, onRename }) => {
  const { theme } = useSettings();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,

        borderWidth: theme === "dark" ? 0 : 1,
        borderColor: "#e5e7eb",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        
        {/* 📁 ICON */}
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: "rgba(34,197,94,0.15)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="folder" size={20} color="#22c55e" />
        </View>

        {/* 📄 TEXT */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme === "dark" ? "#fff" : "#111827",
              fontSize: 15,
              fontWeight: "700",
            }}
            numberOfLines={1}
          >
            {item.folderName}
          </Text>

          <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
            {item.fileCount ?? 0} items
          </Text>
        </View>

        {/* ⚙️ ACTIONS */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>

          {/* ✏️ Rename */}
          <TouchableOpacity
            onPress={() => onRename?.(item.folderId)}
            style={{ padding: 6 }}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={theme === "dark" ? "#fff" : "#111827"}
            />
          </TouchableOpacity>

          {/* ⋯ More / Delete */}
          <TouchableOpacity
            onPress={() => onDelete?.(item.folderId)}
            style={{ padding: 6 }}
          >
            <Ionicons
              name="trash"
              size={20}
              color={theme === "dark" ? "#fff" : "#111827"}
            />
          </TouchableOpacity>

        </View>
      </View>
    </TouchableOpacity>
  );
};

/* -----------------------------------
   📁 SCREEN
----------------------------------- */
export default function FolderScreen() {
  const { theme } = useSettings();

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isGrid, setIsGrid] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFolderContents(selectedFolderId);

  const deleteFolderMutation = useDeleteFolder(selectedFolderId);

  const handleDeleteFolder = (folderId: string) => {
    deleteFolderMutation.mutate({ folderId }, {
      onSuccess: () => {
        // optional: refresh UI is already handled by invalidateQueries in hook
        console.log("Folder deleted");
      }
    });
  };

  const handleRenameFolder = (folderId: string) => {
    console.log("rename:", folderId);
    // later: open modal
  };

  const folders = data?.pages.flatMap((p) => p.folders ?? []) ?? [];
  const files = data?.pages.flatMap((p) => p.files ?? []) ?? [];

  const isInsideFolder = !!selectedFolderId;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme === "dark" ? "#0b1220" : "#f9fafb",
        paddingHorizontal: 16,
      }}
    >
      {/* ✅ HEADER ALWAYS */}
      <FolderHeader
        title={isInsideFolder ? "Folder" : "My Folders"}
        onBackPress={
          isInsideFolder ? () => setSelectedFolderId(null) : undefined
        }
      />

      <Animated.FlatList
        data={isInsideFolder ? files : folders}
        keyExtractor={(item) =>
          isInsideFolder ? item.fileId : item.folderId
        }
        numColumns={isInsideFolder && isGrid ? 2 : 1}
        key={isInsideFolder && isGrid ? "grid" : "list"}
        contentContainerStyle={{
          paddingTop: 10,
          paddingBottom: 120,
        }}

        renderItem={({ item }) =>
          isInsideFolder ? (
            isGrid ? (
              <FileGrid
                fileName={item.fileName}
                uploadedAt={item.uploadedAt}
              />
            ) : (
              <FileRow
                fileName={item.fileName}
                uploadedAt={item.uploadedAt}
              />
            )
          ) : (
            <FolderItem
              item={item}
              onPress={() => setSelectedFolderId(item.folderId)}
              onDelete={handleDeleteFolder}
              onRename={handleRenameFolder}
            />
          )
        }

        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}

        ListEmptyComponent={
          <View style={{ marginTop: 80, alignItems: "center" }}>
            <Text style={{ color: "#94a3b8" }}>
              {isInsideFolder
                ? "This folder is empty"
                : "No folders yet"}
            </Text>
          </View>
        }
      />
    </View>
  );
}