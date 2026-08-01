import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";

import FilePreview from "components/FilePreview";

import { useBottomSheet } from "context/BottomSheetContext";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

type props = {
  visible: boolean;
  file: any;
  onClose: () => void;
}

export default function FilePreviewModal({
  visible,
  file,
  onClose,
}: props) {
  const { closeSheet } = useBottomSheet();
  const { theme } = useSettings();
  const progress = useSharedValue(0);
  const isDark = theme === "dark";

  const textPrimary = isDark
    ? colors.textPrimary
    : colors.textPrimaryLight;

  const textSecondary = isDark
    ? colors.textSecondary
    : colors.textSecondaryLight;

  useEffect(() => {
    if (visible) {
      closeSheet();
      progress.value = withTiming(1, { duration: 220 });
    } else {
      progress.value = withTiming(0, { duration: 180 });
    }
  }, [visible]);

const animatedStyle = useAnimatedStyle(() => {
  return {
    opacity: progress.value,

    transform: [
      {
        scale: 0.85 + progress.value * 0.15,
      },
      {
        translateY: (1 - progress.value) * 60,
      },
    ],
  };
});

  if (!file) return null;

  const extension =
    file?.fileName?.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      {/* OVERLAY */}
      <View style={[styles.overlay, { backgroundColor: isDark ? colors.card : colors.cardLight}]}>

        <Animated.View style={[{ flex: 1 }, animatedStyle]}>



          <SafeAreaView style={styles.container}>
            

            {/* HEADER */}
            <BlurView
              intensity={600}
              tint={isDark ? "dark" : "light"}
              style={[
                  styles.header,
                  {
                  backgroundColor: isDark
                      ? `${colors.accent}CC`
                      : `${colors.accentLight}CC`,
                  marginTop: 10
                  },
                  
              ]}
            >
              <View style={styles.leftSection}>
                <View style={styles.iconBubble}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color={textPrimary}
                  />
                </View>

                <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={[styles.fileName, { color: textPrimary }]}
                    >
                      {file.fileName}
                    </Text>

                    <Text
                      style={[styles.fileType, { color: textSecondary }]}
                    >
                      {extension} file
                    </Text>
                  </View>
                </View>

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color={textPrimary} />
              </TouchableOpacity>
            </BlurView>

            {/* CONTENT */}
            <View style={[styles.content, { marginBottom: 10}]}>
              <View style={{   flex: 1,
                  borderRadius: 18,
                  overflow: "hidden",

                  // subtle separation (not ugly margin)
                  backgroundColor: "transparent",

                  // optional depth (choose one)
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 10 },

                  elevation: 5,}}
              >
                  <FilePreview file={file} />
              </View>
            </View>

          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  /* HEADER */
  header: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight : 10,
    left: 12,
    right: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 14,
    paddingVertical: 12,

    borderRadius: 18,
    overflow: "hidden",
  },

  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  fileName: {
    fontSize: 14,
    fontWeight: "600",
  },

  fileType: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  content: {
    flex: 1,
    marginTop: 90,
    paddingHorizontal: 10,
  },

  /* BACKGROUND (UNCHANGED - YOUR GLOW) */
backgroundGlowTop: {
  position: "absolute",
  top: -140,
  left: -100,
  width: 320,
  height: 320,
  borderRadius: 999,

  backgroundColor: "rgba(120, 120, 255, 0.18)",

  shadowColor: "#6C7CFF",
  shadowOpacity: 0.35,
  shadowRadius: 80,
  shadowOffset: { width: 0, height: 0 },

  elevation: 20,
},

backgroundGlowBottom: {
  position: "absolute",
  bottom: -160,
  right: -120,
  width: 360,
  height: 360,
  borderRadius: 999,

  backgroundColor: "rgba(0, 200, 255, 0.14)",

  shadowColor: "#00D4FF",
  shadowOpacity: 0.3,
  shadowRadius: 90,
  shadowOffset: { width: 0, height: 0 },

  elevation: 20,
},
});