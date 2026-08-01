import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  useWindowDimensions,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PDF from "react-native-pdf";
import Video, {
  OnLoadData,
  OnProgressData,
  ResizeMode,
} from "react-native-video";
import { Ionicons } from "@expo/vector-icons";

import { getFileUrl } from "services/fileService";
import AudioPreview from "./AudioPreview";
import AnimatedLoadingIcon from "./AnimatedLoadingIcon";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import Slider from "@react-native-community/slider";
import { VideoView, useVideoPlayer } from "expo-video";
import ZoomableImage from "./ZoomableImage";
import { useOpenFile } from "hooks/tanstack/useOpenFile";

type PreviewFile = {
  fileId: string;
  key: string;
  fileName: string;
};

const IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp"];
const VIDEO_EXT = ["mp4", "mov", "mkv"];
const AUDIO_EXT = ["mp3", "wav", "m4a", "aac", "ogg"];
const SUPPORTED_EXT = ["pdf", ...IMAGE_EXT, ...VIDEO_EXT, ...AUDIO_EXT];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const FilePreview: React.FC<{ file: PreviewFile }> = ({ file }) => {
  const { width } = useWindowDimensions();

  const { theme } = useSettings();

  const isDark = theme === "dark";

  const bg = isDark
  ? colors.background
  : colors.backgroundLight;

  const textPrimary = isDark
    ? colors.textPrimary
    : colors.textPrimaryLight;

  const textSecondary = isDark
    ? colors.textSecondary
    : colors.textSecondaryLight;

  const ext = file.fileName.split(".").pop()?.toLowerCase();

  const openFileMutation = useOpenFile();

  useEffect(() => {
    openFileMutation.mutate(file.fileId);

    console.log(openFileMutation);
  }, [file.fileId]);

  const url = openFileMutation.data?.url;
  const loading = openFileMutation.isPending;
  const error = openFileMutation.isError;


  /* ================= LOADING ================= */

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <StatusBar barStyle="light-content" />

        <AnimatedLoadingIcon
          active
          size={70}
          source={require("../assets/lottie/Loading.json")}
        />

        <Text style={[styles.loadingText, { color: textSecondary }]}>
          Preparing preview...
        </Text>
      </View>
    );
  }

  /* ================= ERROR ================= */

  if (error || !url) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <Ionicons
          name="cloud-offline-outline"
          size={52}
          color="#F87171"
        />

        <Text style={[styles.errorTitle, { color: "#F87171" }]}>
          Preview failed
        </Text>

        <Text style={[styles.errorSub, { color: textSecondary }]}>
          Unable to load file preview
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "transparent" }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.inner}>
        {/* PDF */}

        {ext === "pdf" && (
          <PDF
            source={{ uri: url }}
            style={styles.full}
            trustAllCerts={false}
          />
        )}

        {/* IMAGE */}

        {IMAGE_EXT.includes(ext || "") && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: url }}
              style={styles.full}
              resizeMode="contain"
            />
          </View>
        )}

        {/* VIDEO */}
        {VIDEO_EXT.includes(ext || "") && url && (
          <View style={styles.videoWrapper}>
            <Video
              source={{ uri: url }}
              style={styles.video}
              controls
              resizeMode="contain"
            />
          </View>
        )}

        {/* AUDIO */}

        {AUDIO_EXT.includes(ext || "") && (
          <View style={styles.audioWrapper}>
            <AudioPreview
              uri={url}
              fileName={file.fileName}
            />
          </View>
        )}

        {/* UNSUPPORTED */}

        {!SUPPORTED_EXT.includes(ext || "") && (
          <View style={styles.center}>
            <Ionicons
              name="document-outline"
              size={52}
              color={textSecondary}
            />

            <Text
              style={[
                styles.errorTitle,
                { color: textPrimary },
              ]}
            >
              Unsupported file
            </Text>

            <Text
              style={[
                styles.errorSub,
                { color: textSecondary },
              ]}
            >
              This file type cannot be previewed
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default FilePreview;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  inner: {
    flex: 1,
  },
videoWrapper: {
  flex: 1,
  backgroundColor: "black", // only true background you need
  justifyContent: "center",
},
videoGlass: {
  width: "100%",
  aspectRatio: 9 / 16,
  borderRadius: 18,
  overflow: "hidden",

  // soft glass effect
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.06)",

  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },

  elevation: 6,
},

video: {
  width: "100%",
  height: "100%",
},

  full: {
    width: "100%",
    height: "100%",
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "black",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "500",
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  errorSub: {
    marginTop: 4,
    fontSize: 13,
    textAlign: "center",
  },

  imageContainer: {
    flex: 1,
    backgroundColor: "black",
  },

  /* VIDEO */

  videoWrapper: {
    flex: 1,
    backgroundColor: "black",
    overflow: "hidden",
  },

  videoLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  fileName: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },

  centerControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  playButton: {
    width: 82,
    height: 82,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  progressBackground: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "white",
  },

  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  timeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  audioWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});