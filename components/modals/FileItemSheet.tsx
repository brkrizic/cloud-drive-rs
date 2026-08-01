import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "constants/colors";
import { FileIcon } from "components/Fileicon";
import { useSettings } from "context/SettingsContext";

type Props = {
  fileName: string;
  uploadedAt: string | number;
  isGrid?: boolean;

  onPreview?: () => void;
  onDownload?: () => void;
  onInfo?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
};

export function FileItemSheet({
  fileName,
  uploadedAt,
  isGrid = false,

  onPreview,
  onDownload,
  onInfo,
  onDelete,
  onShare,
}: Props) {
  const { theme } = useSettings();

  const isDark = theme === "dark";

  const screenWidth =
    Dimensions.get("window").width;

  const containerPadding = 32;
  const spacing = 12;

  const itemWidth = isGrid
    ? (screenWidth -
        containerPadding -
        spacing) /
      2
    : "100%";

  const themeColors = {
    background: isDark
      ? colors.card
      : colors.cardLight,

    surface: isDark
      ? colors.cardHover
      : colors.surfaceLight,

    textPrimary: isDark
      ? colors.textPrimary
      : colors.textPrimaryLight,

    textSecondary: isDark
      ? colors.textSecondary
      : colors.textSecondaryLight,

    accent: isDark
      ? colors.accent
      : colors.accentLight,

    border: isDark
      ? "rgba(255,255,255,0.05)"
      : "rgba(15,23,42,0.06)",
  };

  const styles = createStyles(
    themeColors,
    isDark
  );

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={[
        styles.container,
        {
          width: itemWidth,
        },
      ]}
      onPress={onPreview}
    >
      {/* TOP */}
      <View
        style={[
          styles.topSection,
          {
            flexDirection: isGrid
              ? "column"
              : "row",
          },
        ]}
      >
        {/* ICON */}
        <View style={styles.iconWrapper}>
          <FileIcon
            ext={
              fileName
                .split(".")
                .pop() || ""
            }
          />
        </View>

        {/* TEXT */}
        <View
          style={[
            styles.textContainer,
            {
              marginLeft: isGrid
                ? 0
                : 14,

              marginTop: isGrid
                ? 12
                : 0,
            },
          ]}
        >
          <Text
            style={styles.fileName}
            numberOfLines={1}
          >
            {fileName}
          </Text>

          <Text style={styles.date}>
            {new Date(
              uploadedAt
            ).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* ACTIONS */}
      <View style={styles.actionsRow}>
        {/* SHARE */}
        {onShare && (
          <TouchableOpacity
            style={styles.shareButton}
            onPress={onShare}
            activeOpacity={0.85}
          >
            <Ionicons
              name="share-social"
              size={18}
              color="#fff"
            />

            <Text style={styles.shareText}>
              Share
            </Text>
          </TouchableOpacity>
        )}

        {/* SMALL ACTIONS */}
        <View style={styles.secondaryActions}>
          {onPreview && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onPreview}
            >
              <Ionicons
                name="eye-outline"
                size={18}
                color={
                  themeColors.textSecondary
                }
              />
            </TouchableOpacity>
          )}

          {onDownload && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onDownload}
            >
              <Ionicons
                name="download-outline"
                size={18}
                color={
                  themeColors.textSecondary
                }
              />
            </TouchableOpacity>
          )}

          {onInfo && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onInfo}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={
                  themeColors.textSecondary
                }
              />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                styles.deleteBtn,
              ]}
              onPress={onDelete}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color="#EF4444"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (
  themeColors,
  isDark
) =>
  StyleSheet.create({
    container: {
      backgroundColor:
        themeColors.background,

      borderRadius: 24,

      padding: 16,

      paddingBottom: 65,

      marginBottom: 0,

      borderWidth: 1,
      borderColor:
        themeColors.border,

      shadowColor: "#000",

      shadowOpacity: isDark
        ? 0.2
        : 0.05,

      shadowRadius: 16,

      shadowOffset: {
        width: 0,
        height: 6,
      },

      elevation: 4,
    },

    topSection: {
      alignItems: "center",
    },

    iconWrapper: {
      width: 58,
      height: 58,

      borderRadius: 18,

      justifyContent: "center",
      alignItems: "center",

      backgroundColor:
        themeColors.surface,
    },

    textContainer: {
      flex: 1,
      alignItems: "flex-start",
    },

    fileName: {
      fontSize: 15,

      fontWeight: "700",

      color:
        themeColors.textPrimary,
    },

    date: {
      marginTop: 5,

      fontSize: 12,

      color:
        themeColors.textSecondary,
    },

    actionsRow: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      marginTop: 18,
    },

    // MAIN SHARE CTA
    shareButton: {
      flexDirection: "row",

      alignItems: "center",

      backgroundColor:
        "#8B5CF6",

      paddingHorizontal: 16,
      paddingVertical: 12,

      borderRadius: 16,

      shadowColor:
        themeColors.accent,

      shadowOpacity: 0.25,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 5,
    },

    shareText: {
      color: "#fff",

      marginLeft: 8,

      fontWeight: "700",

      fontSize: 13,
    },

    secondaryActions: {
      flexDirection: "row",

      alignItems: "center",

      backgroundColor:
        themeColors.surface,

      borderRadius: 16,

      padding: 4,
    },

    secondaryBtn: {
      width: 42,
      height: 42,

      borderRadius: 12,

      justifyContent: "center",
      alignItems: "center",
    },

    deleteBtn: {
      backgroundColor:
        "rgba(239,68,68,0.08)",
    },
  });