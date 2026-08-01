import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import { fileIcons } from "constants/fileIcons";
import { ExplorerItem, FileItem } from "constants/fileItem";
import { useBottomSheet } from "context/BottomSheetContext";
import FileInfoSheet from "components/modals/FileInfoSheet";
import Header from "components/Header";
import { useFileQuery } from "context/FileQueryContext";
import AnimatedLoadingIcon from "components/AnimatedLoadingIcon";
import { FileIcon } from "components/Fileicon";
import { FileRow } from "components/FileRow";
import { FileGrid } from "components/FileGrid";
import { FileItemSheet } from "components/modals/FileItemSheet";
import { useFilesQuery } from "hooks/tanstack/useFilesQuery";
import { DeleteModal } from "components/modals/DeleteFileModal";
import { useDeleteFile } from "hooks/tanstack/useDeleteFile";
import { useFilesQueryKey } from "hooks/useFilesQueryKey";
import Animated from "react-native-reanimated";
import { useDeleteFolder } from "hooks/tanstack/useFolderQuery";
import FolderHeader from "components/FolderHeader";
import { FolderItem } from "components/FolderItem";
import { getFilesFromDb, getItemsFromDb, upsertFiles } from "database/fileRepo";
import { runDbWrite } from "database/dbService";
import { upsertFolders } from "database/folderRepo";
import { useLocalItems } from "hooks/useLocalItems";
import { useSyncServerToLocalDB } from "hooks/useSyncServerToLocalDB";
import { useUploadsQuery } from "hooks/tanstack/useUploadsQuery";


type HomeScreenProps = {
  handleDownload: (key: string) => Promise<void>;
  handlePreview: (file: FileItem) => void;
  previewVisible: boolean;
  setPreviewVisible: React.Dispatch<React.SetStateAction<boolean>>;
  scrollHandler?: (event: any) => void;
  setUserData: React.Dispatch<React.SetStateAction<Object>>
  handleShare: (fileId: string) => void;
  handleDeleteFolder: (folderId: string, folderName: string) => void;
  handleRenameFolder: (value1: string, value2: string) => void;
  setSelectedFolder: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function HomeScreen({
  handlePreview,
  setPreviewVisible,
  previewVisible,
  handleDownload,
  scrollHandler,
  setUserData,
  handleShare,
  handleDeleteFolder,
  handleRenameFolder,
  setSelectedFolder
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useSettings();
  const { openSheet } = useBottomSheet();

  const [isGrid, setIsGrid] = useState(false);

  // 🌟 Get everything from FileQueryContext
  // const {
  //   files,
  //   isLoading,
  //   hasMore,
  //   fetchNextPage,
  //   sortMode,
  //   setSortMode,
  //   filterTypes,
  //   toggleFilter,
  //   searchText,
  //   setSearchText,
  // } = useFileQuery();

  const { sortMode, setSortMode, filterTypes, toggleFilter, searchText, setSearchText } = useFileQuery();


  const queryKey = useFilesQueryKey();

  const bg = theme === "dark" ? colors.background : colors.backgroundLight;
  const card = theme === "dark" ? colors.card : colors.cardLight;
  const textPrimary = theme === "dark" ? colors.textPrimary : colors.textPrimaryLight;
  const textSecondary = theme === "dark" ? colors.textSecondary : colors.textSecondaryLight;
  const accent = theme === "dark" ? colors.accent : colors.accentLight;

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const { icon: IconComponent, name: iconName, color } = fileIcons[ext] || fileIcons.default;
    const finalColor = color === "#94A3B8" ? textSecondary : color;
    return  <FileIcon ext={ext}/>;
  };

  // const uploadsAsFiles = useMemo(() => 
  //   uploads.map(jobToFileItem), [uploads]);

  // const displayedFiles = useMemo(() => {
  //   const merged = [...uploadsAsFiles, ...files]; 
    
  //   // Optional: client-side search
  //   if (!searchText) return merged;
  //   return merged.filter(f => f.fileName.toLowerCase().includes(searchText.toLowerCase()));
  // }, [uploadsAsFiles, files, searchText]);

  const [selectedFile, setSelectedFile] = useState<FileItem | null>();

  const deleteMutation = useDeleteFile(queryKey);
  const [deleteVisible, setDeleteVisible] = useState(false);
  
  const handleDelete = (file: FileItem) => {
    setSelectedFile(file);
    setDeleteVisible(true);
  };

  const { closeSheet } = useBottomSheet();
  

  const [folderStack, setFolderStack] = useState<any[]>([]);
  
  const [showFolders, setShowFolders] = useState<boolean>(false);

  const currentFolder =
    folderStack[folderStack.length - 1] ?? null;

  const currentFolderId =
    currentFolder?.folderId ?? null;

  const isInsideFolder = !!currentFolderId;


  const { isFetching, hasNextPage, fetchNextPage } =
    useSyncServerToLocalDB(setUserData);

  const { data: uploads = [] } = useUploadsQuery();

  const uploadsAsFiles = useMemo(() => {
    return uploads
      .filter(u => u.status !== "completed")
      .map<FileItem>(u => ({
        type: "file",

        fileId: u.id,
        key: "",

        fileName: u.fileName,
        folderUd: null,

        contentType: u.contentType,
        fileSize: u.fileSize,

        uploadedAt: u.createdAt,

        lastViewed: undefined,
        lastViewedBy: undefined,

        // upload state
        isUploading: true,
        uploadStatus: u.status,
        uploadProgress: u.progress,
      }));
  }, [uploads]);

  // const itemsDb = useLocalItems(currentFolderId);

  const localItems = useLocalItems(currentFolderId);


  const itemsDb = useMemo(() => {

    const merged = [
      ...uploadsAsFiles,
      ...localItems
    ];

    return merged;

  }, [uploadsAsFiles, localItems]);

  const openFileItemSheet = (item: FileItem) => {
    openSheet(
      <FileItemSheet
        fileName={item.fileName}
        uploadedAt={item.uploadedAt}
        isGrid={false}        // true if you want it to render like grid
        onPreview={() => handlePreview(item)}
        onDownload={() => handleDownload(item.key)}
        onInfo={() =>
          openSheet(
            <FileInfoSheet
              file={item}
              onPreview={() => handlePreview(item)}
              onDownload={() => handleDownload(item.key)}
            />
          )
        }
        onShare={() => handleShare(item.fileId)}
        onDelete={() => handleDelete(item)}
        onActionPress={() => console.log("action pressed")} // optional
      />
    );
  }

  const renderItem = useCallback(
    ({ item }: { item: ExplorerItem }) => {

      // -------------------------
      // FOLDER
      // -------------------------
      if (item.type === "folder") {
        return (
          <FolderItem
            item={item}

            onPress={() => {
              setFolderStack(prev => [...prev, item]);
            }}

            onDelete={handleDeleteFolder}

            onRename={handleRenameFolder}
          />
        );
      }

      // -------------------------
      // FILE
      // -------------------------
      return isGrid ? (
        <FileGrid
          fileName={item.fileName}
          uploadedAt={item.uploadedAt}
          onActionPress={() => openFileItemSheet(item)}
        />
      ) : (
        <FileRow
          fileName={item.fileName}
          uploadedAt={item.uploadedAt}
          lastViewedAt={item.lastViewed}
          lastViewedBy={item.lastViewedBy}

          isUploading={item.isUploading}
          uploadProgress={item.uploadProgress}
          uploadStatus={item.uploadStatus}

          onActionPress={() => openFileItemSheet(item)}
        />
      );
    },
    [isGrid]
  );

  const onEndReachedCalledDuringMomentum = useRef(false);


  // REAL EXPLORER FILTERING
  const visibleItems = useMemo(() => {
    return itemsDb.filter((item: ExplorerItem) => {
      const parentId =
        item.type === "file"
          ? item.folderId
          : item.parentFolderId;

      // ROOT LEVEL
      if (!currentFolderId) {
        const isRoot = parentId == null;
        return isRoot;
      }

      // INSIDE FOLDER
      return parentId === currentFolderId;
    });
  }, [itemsDb, currentFolderId, showFolders]);

  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingHorizontal: 10 }}>
      <Header 
        query={searchText} 
        setQuery={setSearchText} 
        setSortMode={setSortMode} 
        sortMode={sortMode} 
        toggleFilter={toggleFilter} 
        isGrid={isGrid} 
        setIsGrid={setIsGrid} 
        setShowFolders={setShowFolders} 
        showFolders={showFolders}
      />

      <View style={{ marginTop: -20 }} />

      {isFetching && visibleItems.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: bg }}>
          {/* <ActivityIndicator size="large" color={accent} /> */}
          <AnimatedLoadingIcon active={true} size={50} source={require('../assets/lottie/Loading.json')}/>
        </View>
      ) : (
        <>
          {/* <TouchableOpacity onPress={() => setShowFolders(prev => !prev)}>
            <Text>
              {showFolders ? "Hide Folders" : "Show Folders"}
            </Text>
          </TouchableOpacity> */}

          <FolderHeader
            title={
              currentFolder?.folderName
            }

            onBackPress={
              isInsideFolder
                ? () => {
                    setFolderStack(prev =>
                      prev.slice(0, -1)
                    );
                  }
                : undefined
            }
          />
          <Animated.FlatList
            data={visibleItems}
            keyExtractor={(item) =>
              item.type === "folder"
                ? item.folderId
                : item.fileId
            }
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            onEndReached={() => {
              if (!isFetching && hasNextPage) fetchNextPage();
            }}
            numColumns={isGrid ? 2 : 1}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews
            key={isGrid ? "grid" : "list"}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            onMomentumScrollBegin={() => {
              onEndReachedCalledDuringMomentum.current = false;
            }}
            onEndReached={() => {
              if (!onEndReachedCalledDuringMomentum.current && hasNextPage && !isFetching) {
                fetchNextPage();
                onEndReachedCalledDuringMomentum.current = true;
              }
            }}
            ListFooterComponent={() => (isFetching && visibleItems.length > 0 ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', margin: 10 }}>
                                                        <AnimatedLoadingIcon active={true} size={30} source={require('../assets/lottie/Loading.json')} />
                                                      </View> : null)}
            contentContainerStyle={{ paddingBottom: 102 }}
            ListEmptyComponent={() => (
              <View style={{ flex:1, justifyContent:'center', alignItems:'center', paddingBottom: insets.bottom, marginTop: 50 }}>
                <Text style={{ color: textSecondary }}>No files uploaded yet.</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}