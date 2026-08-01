import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import UploadProgressCircle from "./UploadProgressCircle";
import AnimatedLoadingIcon from "./AnimatedLoadingIcon";

type QuickActionNavProps = {
  handleUpload: () => Promise<void>;
  uploading?: boolean;
  setUploaderVisible: (value: boolean) => void;
  uploadProgress: number;
  handlePickFile: () => Promise<void>;
  loadingFileInfo: boolean;
  setShowCreateFolder: (value: boolean) => void;
  setShowShare: (value: boolean) => void;
};

export default function QuickActionsNav({ handleUpload, uploading = false, setUploaderVisible, uploadProgress, handlePickFile, loadingFileInfo, setShowCreateFolder, setShowShare }: QuickActionNavProps) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const { theme } = useSettings();


  // theme-aware colors
  const mainBg = theme === "dark" ? "#243B6B" : "#fff";
  const actionBg = theme === "dark" ? "#111A33" : "#fff";
  const mainIcon = theme === "dark" ? "#fff" : "#1F2937";

  const toggle = () => {
    Animated.timing(anim, {
      toValue: open ? 0 : 1,
      duration: 380,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  const actions = [
    {
      icon: "cloud-upload-outline",
      label: "Upload",
      color: colors.accent,
      onPress: uploading ? undefined : handlePickFile,
      showIndicator: uploading,
    },
    {
      icon: "folder-outline",
      label: "New Folder",
      color: colors.textHighlight,
      onPress: () => setShowCreateFolder(true),
    },
    // {
    //   icon: "document-outline",
    //   label: "Add Text Document",
    //   color: "#64748B",
    //   onPress: () => setUploaderVisible(true),
    // },
  ];

  if(loadingFileInfo) return (
    <View style={[styles.loadingIcon, styles.root, {marginRight: 15}]}>
      <AnimatedLoadingIcon source={require('../assets/lottie/DocumentLoader.json')} size={100}/>
      <Text style={styles.loadingText} numberOfLines={1}>Preparing file</Text>
    </View>
  );

  return (
    <View style={styles.root} pointerEvents="box-none">
      {actions.map((action, index) => {
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(index + 1) * 68],
        });

        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1],
        });

        const opacity = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        });

        return (
          <Animated.View
            key={action.label}
            style={[
              styles.actionContainer,
              { transform: [{ translateY }, { scale }], opacity },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.actionButton, { borderLeftColor: action.color, backgroundColor: actionBg }]}
              onPress={action.onPress}
            >
              {action.showIndicator ? (
                <ActivityIndicator size="small" color={action.color} />
              ) : (
                <Ionicons name={action.icon as any} size={22} color={action.color} />
              )}
              {/* <Text style={[styles.actionText, { color: theme === "dark" ? colors.textPrimary : colors.textPrimaryLight }]}>
                {action.label}
              </Text> */}
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* MAIN FAB */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={toggle}
          style={[styles.mainButton, { backgroundColor: mainBg }]}
        >
          {uploading ? (
            <UploadProgressCircle progress={uploadProgress} size={60} />
          ) : (
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "45deg"],
                    }),
                  },
                ],
              }}
            >
              <Ionicons name="add" size={30} color={mainIcon} />

            </Animated.View>
          )}
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    bottom: 140,
    right: 24,
    zIndex: 100,
    alignItems: "center",
  },

  mainButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center"
  },

  actionContainer: {
    position: "absolute",
    bottom: 0,
    right: 6,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 14,
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  actionText: {
    fontSize: 7,
    fontWeight: "600",
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  loadingText: {
    marginTop: -10,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.1,
    color: colors.accentLight,
    textAlign: "center",
    opacity: 0.9,
  },
});
