import React, { useEffect, useRef, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import Toast from "react-native-toast-message";
import { toastConfig } from "config/toastConfig";

import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import QuickActionsNav from "components/QuickActionNav";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import { useDownloadUrl } from "hooks/useDownloadUrl";
import * as Linking from 'expo-linking';
import TextUploader from "components/modals/TextUploader";
import { useFilePreview } from "hooks/useFilePreview";
import FilePreviewModal from "components/modals/FilePreviewModal";
import Animated from "react-native-reanimated";
import 'react-native-get-random-values';
import { useBottomSheet } from "context/BottomSheetContext";
import { UploadSheet } from "components/modals/UploadSheet";
import { Job, UploadContext, UploadJob } from "constants/job";
import { useUploadProgress, useUploads } from "context/UploadProgressContext";

import { cleanupOldCompletedUploads, getAllUploads, markUploadAsNotified, reconcileUploads } from "database/uploadRepo";
import FilePrepareScreen from "screens/FilePrepareScreen";
import UploadManagerFab from "components/UploadManagerFab";
import { useUploadFile } from "hooks/tanstack/useUploadManager";
import { useUser } from "context/UserContext";
import { prepareUploadJob } from "services/uploadService";
import { normalizeFile, uploadEvents } from "utils/uploadHelper";
import { FileItem } from "constants/fileItem";
import { setGlobalErrorModal, showErrorModal } from "handlers/globalErrorHandler";
import ErrorModal from "components/modals/ErrorModal";
import { saveMetadata } from "services/fileService";
import FlashMessage, { showMessage } from "react-native-flash-message";
import { getDb } from "database/db";
import { enforceAllLimitsOnBoot } from "utils/dbCleanUp";
import { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useFabVisibility } from "hooks/useFabVisibility";
import { useNavigationState } from "@react-navigation/native";
import FolderScreen from "screens/FolderScreen";
import CreateFolderModal from "components/modals/CreateFolderModal";
import { SharingScreen } from "screens/SharingScreen";
import { ShareModal } from "components/modals/ShareModal";
import { startSyncEngine } from "services/syncService";
import { createFolderLocally, deleteFolderLocally, renameFolderLocally } from "services/local/folderLocalService";
import { DeleteFolderModal } from "components/modals/DeleteFolderModal";
import { Folder } from "constants/folder";
import RenameFolderModal from "components/modals/RenameFolderModal";
import { DeleteFileModal } from "components/modals/DeleteFileModal";

const Tab = createBottomTabNavigator();

export default function AppTabs({ dbReady }: { dbReady: boolean }) {
  const { theme, setTheme } = useSettings();
  const [modal, setModal] = useState({
    visible: false,
    title: "",
    message: "",
    icon: ""
  });

  useEffect(() => {
    setGlobalErrorModal(
      (title, message, icon) => {
        setModal({
          visible: true,
          title,
          message: message || "",
          icon: icon || ""
        });
      },
      () => {
        setModal({
          visible: false,
          title: "",
          message: "",
          icon: ""
        });
      }
    );
  }, []);

  // useEffect(() => {
  //   console.log("Cleaning up");
  //   enforceAllLimitsOnBoot();
  // }, [dbReady]);

  // Notification notifiying shit
  useEffect(() => {
    const handleNotifications = async () => {
      const jobs = await getAllUploads();

      const unseen = jobs.filter(j => !j.notified && j.status !== "uploading");

      for (const job of unseen) {

        if (job.status === "completed") {
          showMessage({
            message: "Upload complete",
            description: job.fileName,
            type: "success",
          });
        }

        if (job.status === "failed") {
          showMessage({
            message: "Upload failed",
            description: job.fileName,
            type: "danger",
          });
        }

        await markUploadAsNotified(job.id);
        await cleanupOldCompletedUploads();
      }
    };

    handleNotifications();
  }, []);


  const [uploaderVisible, setUploaderVisible] = useState(false);

  // Theme-aware colors
  const bgColor = theme === "dark" ? colors.background : colors.backgroundLight;
  const tabActive = theme === "dark" ? colors.tabIconColorDark : colors.tabIconColorLight;
  const tabInactive = theme === "dark" ? colors.textSecondary : colors.textSecondaryLight;


  // HomeScreen state
  // const [files, setFiles] = useState<FileItem[]>([]);

  const [previewVisible, setPreviewVisible] = useState(false);

  const { fetchDownloadUrl } = useDownloadUrl();




  const handleDownload = async (key: string) => {
    try {
      const downloadUrl = await fetchDownloadUrl(key);

      await Linking.openURL(downloadUrl);

  
      Toast.show({
        type: 'success',
        text1: 'Download started',
        text2: 'Check your browser downloads',
      });



    } catch (error) {
      console.error('Download failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handlePreview = (file: FileItem) => {
    setSelectedFile(file);
    setPreviewVisible(true);
  };

  // ProfileScreen
  const { userData, setUserData } = useUser();

  // Quick Actions

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const { openSheet } = useBottomSheet();

  const [fileInfoVisible, setFileInfoVisible] = useState(false);
  const [fileInfo, setFileInfo] = useState<Job>();
  const [loadingFileInfo, setLoadingFileInfo] = useState<boolean>(false);

  const [jobs, setJobs] = useState<UploadJob[]>([]);

  const [isText, setIsText] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const { setProgress, clearProgress } = useUploadProgress();
  const [file, setFile] = useState<any>(null);

  useEffect(() => {
    const onProgress = ({ jobId, progress }: any) => {
      if (!jobId) return;
      setProgress(jobId, progress);
    };

    const onDone = ({ jobId }: any) => {
      if (!jobId) return;
      clearProgress(jobId);
    };

    const progressSub = uploadEvents.addListener("progress", onProgress);
    const doneSub = uploadEvents.addListener("done", onDone);

    return () => {
      progressSub.remove();
      doneSub.remove();
    };
  }, [setProgress, clearProgress])



  const onCloseFileInfoModal = () => {
    console.log("Closing upload");
    setFileInfo(undefined);
    setJobs([]);
    setFileInfoVisible(false);
  }

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     if (AppState.currentState !== 'active') return;
  //     const jobs = await getAllUploads(); // read DB
  //     setUploads(jobs); // sync UI from DB
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  // FAB UI
  const { scrollHandler, fabStyle, fabVisible } = useFabVisibility();

  // FILES

  const [selectedFile, setSelectedFile] = useState<FileItem | null>();
  const [deleteFileModalVisible, setDeleteFileModalVisible] = useState<boolean>(false);
  const [showShare, setShowShare] = useState<boolean>(false);
  const [fileToShare, setFileToShare] = useState<string>('');

  const handleDeleteFile = async (file: FileItem) => {
    setSelectedFile(file);
    setDeleteFileModalVisible(true);
  };

  const confirmDeleteFileLoc = async () => {
    if(!selectedFile) return;

    
  };

 
  const handleShareFile = (fileId: string) => {
    setShowShare(true);
    setFileToShare(fileId);
  };

  const confirmShareFile = async () => {

  };

  const { uploadFile, uploadFiles } = useUploadFile({
    onOpenSheet: () => openSheet(<UploadSheet/>)
  });

  const MAX_FILES = 50;

  const onPickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
    });

    // 🔒 HARD GUARD
    if (result.canceled || !result.assets || !Array.isArray(result.assets)) {
      console.log("No valid files selected");
      showErrorModal("File Error", "No valid files selected", require('../assets/lottie/error.json'),);
      return;
    }
    
    let files = result.assets ?? [];

    // 🔥 enforce limit
    if (files.length > MAX_FILES) {
      showErrorModal(
        "Limit reached",
        `You can select up to ${MAX_FILES} files at once. Only the first ${MAX_FILES} will be used.`,
        require('../assets/lottie/error.json'),
      );

      files = files.slice(0, MAX_FILES);
    }

    setLoadingFileInfo(true);

    try {
      const jobs: UploadJob[] = [];

      for (const rawFile of files) {
        // 🔒 EXTRA GUARD (important)
        if (!rawFile) continue;

        const file = normalizeFile(rawFile);
        const job = await prepareUploadJob(file);

        jobs.push(job);
      }

      if (!jobs.length) {
        console.log("No valid jobs created");
        return;
      }

      setJobs((prev) => [...prev, ...jobs]);

      console.log("JOBS: ", jobs);

      setFileInfoVisible(true); // now you show list, not single
    } catch (err) {
      console.error("Error preparing jobs:", err);
    } finally {
      setLoadingFileInfo(false);
    }
  };

  const handleUpload = async (jobs: UploadJob[], fileName?: string) => {
    if (!jobs.length) {
      console.log("No jobs!");
      return;
    }

    console.log("STARTING MULTIPLE UPLOADS...");

    const updatedJobs = jobs.map((job) => ({
      ...job,
      fileName:
        typeof fileName === "string"
          ? fileName
          : job.fileName,
  }));

  console.log("Updated Jobs: ", updatedJobs);

  uploadFiles(updatedJobs); // 🔥 clean batch call

  setJobs([]);
  setFileInfoVisible(false);
  };




  // FOLDERS

  const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false);
  const [deleteFolderModalVisible, setDeleteFolderModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [showRenameFolderModal, setShowRenameFolderModal] = useState<boolean>(false);

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    setSelectedFolderId(folderId);
    setSelectedFolder(folderName);
    setDeleteFolderModalVisible(true);
  };

  const confirmDeleteFolderLoc = async (folderId: string) => {
    await deleteFolderLocally(folderId);
    setDeleteFolderModalVisible(false);
  };

  const handleCreateFolder = async (name: string, parentFolderId: string | null) => {
    const folderName = name.trim();

    await createFolderLocally(folderName, parentFolderId);
  };

  const handleRenameFolder = async (folderId: string, currentFolderName: string) => {
    setShowRenameFolderModal(true);
    setSelectedFolderId(folderId);
    setSelectedFolder(currentFolderName);
  };

  const confirmRenameFolderLoc = async (folderId: string, newFolderName: string) => {
    await renameFolderLocally(folderId, newFolderName);
    setShowRenameFolderModal(false);
  };

  // useEffect(() => {
  //   startSyncEngine();
  // }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { height: 64, backgroundColor: bgColor, paddingTop: 8 },
          tabBarActiveTintColor: tabActive,
          tabBarInactiveTintColor: tabInactive,
          tabBarIcon: ({ color, focused }) => {
            let icon = "home";
            if (route.name === "Home") icon = focused ? "home" : "home-outline";
            if (route.name === "Folders") icon = focused ? "folder" : "folder-outline";
            if (route.name === "Sharing") icon = focused ? "people" : "people-outline";
            if (route.name === "Gallery") icon = focused ? "image" : "image-outline";
            if (route.name === "Music") icon = focused ? "musical-notes" : "musical-notes-outline";
            if (route.name === "Profile") icon = focused ? "person" : "person-outline";
            if (route.name === "Settings") icon = focused ? "settings" : "settings-outline";
            return <Ionicons name={icon} size={24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home">
          {(props) => <HomeScreen 
                          {...props} 
                          // files={files} 
                          // loading={loading} 
                          // loadingMore={loadingMore}
                          // loadFiles={loadFiles} 
                          handleDownload={handleDownload}
                          handlePreview={handlePreview}
                          setUserData={setUserData} 
                          // selectedFile={selectedFile} 
                          // setSelectedFile={setSelectedFile}
                          setPreviewVisible={setPreviewVisible}
                          previewVisible={previewVisible}
                          scrollHandler={scrollHandler}
                          handleShareFile={handleShareFile}
                          // lastKey={lastKey}
                          handleDeleteFolder={handleDeleteFolder}
                          handleRenameFolder={handleRenameFolder}
                      />}
        </Tab.Screen>
        {/* <Tab.Screen
          name="Folders"
          component={FolderScreen}
        /> */}
        <Tab.Screen
          name="Sharing"
          component={SharingScreen}
        />
        {/* <Tab.Screen name="Gallery">
          {(props) => <GalleryScreen {...props} files={files} loadFiles={loadFiles} loading={loading} loadingMore={loadingMore}/>}
        </Tab.Screen> */}
        {/* <Tab.Screen name="Music">
          {(props) => <MusicScreen {...props} files={files}/>}
        </Tab.Screen> */}
        {/* <Tab.Screen name="Profile" component={ProfileDrawer} /> */}
        <Tab.Screen name="Settings">
          {(props) => <SettingsScreen {...props} fabVisible={fabVisible} />}
        </Tab.Screen>
      </Tab.Navigator>
          
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 16,
            right: 0,
          },
          fabStyle
        ]}
        >
            <QuickActionsNav
              loadingFileInfo={loadingFileInfo}
              handleUpload={handleUpload}
              handlePickFile={onPickFile}
              uploading={uploading}
              setUploaderVisible={setUploaderVisible}
              uploadProgress={uploadProgress}
              setShowCreateFolder={setShowCreateFolder}
              setShowShare={setShowShare}
            />

            {!loadingFileInfo && (
              <UploadManagerFab
                uploadCount={0}
                onPress={() => openSheet(<UploadSheet />)}
              />
            )}
        </Animated.View>

      <Toast config={toastConfig} />
      {uploaderVisible && <TextUploader 
                            onUploaded={() => console.log("Starting uploading...")} 
                            onClose={() => setUploaderVisible(false)} 
                            uploaderVisible={uploaderVisible} 
                            setIsText={setIsText} 
                            setTitle={setTitle} 
                            setDescription={setDescription}
                            title={title}
                            description={description}
                            setCurrentJob={setCurrentJob}
                          />}
      {previewVisible && <FilePreviewModal 
                            visible={previewVisible} 
                            onClose={() => setPreviewVisible(false)} 
                            file={selectedFile}/>}
      {fileInfoVisible &&   <FilePrepareScreen
                              jobs={jobs}
                              setJobs={setJobs}
                              onUpload={handleUpload}
                              onClose={onCloseFileInfoModal}
                              loading={loadingFileInfo}
                            />}
                            <ErrorModal
                                visible={modal.visible}
                                title={modal.title}
                                message={modal.message}
                                icon={modal.icon}
                                onClose={() =>
                                  setModal({ visible: false, title: "", message: "", icon: "" })
                                }
                            />
        <FlashMessage/>
        {showCreateFolder && (
          <CreateFolderModal setShowCreateFolder={setShowCreateFolder} handleCreateFolder={handleCreateFolder}/>
        )}
        {showRenameFolderModal && (
          <RenameFolderModal
            folderId={selectedFolderId}
            currentFolderName={selectedFolder}
            setShowRenameFolderModal={setShowRenameFolderModal}
            onCancel={() => setShowRenameFolderModal(false)}
            onConfirm={confirmRenameFolderLoc}
          />
        )}
        {showShare && (
          <ShareModal setShowShare={setShowShare} visible={showShare} fileId={fileToShare}/>
        )}

        {deleteFolderModalVisible && (
          <DeleteFolderModal
            visible={deleteFolderModalVisible}
            selectedFolder={selectedFolder}
            folderId={selectedFolderId}
            onCancel={() => setDeleteFolderModalVisible(false)}
            onConfirm={confirmDeleteFolderLoc}
          />
        )}
      {deleteFileModalVisible && <DeleteFileModal
                                    visible={deleteFileModalVisible}
                                    fileName={selectedFile?.fileName}
                                    onCancel={() => setDeleteFileModalVisible(false)}
                                    onConfirm={confirmDelete}
                                />
      }
    </SafeAreaView>
  );
}
