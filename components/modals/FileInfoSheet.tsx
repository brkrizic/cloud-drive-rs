import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "context/SettingsContext";
import { fileIcons } from "constants/fileIcons";
import { colors } from "constants/colors";
import { FileItem } from "constants/fileItem";
import { useBottomSheet } from "context/BottomSheetContext";
import AnimatedLoadingIcon from "components/AnimatedLoadingIcon";

type Props = {
  file: FileItem;
  onDownload?: () => void;
  onPreview?: () => void;
  loading?: boolean;
};

export default function FileInfoSheet({
  file,
  onDownload,
  onPreview,
  loading = false,
}: Props) {
  const { closeSheet } = useBottomSheet();
  const { theme } = useSettings();

  /* ================= THEME ================= */
  const themeColors = useMemo(() => {
    const isDark = theme === "dark";

    return {
      bg: isDark ? colors.background : colors.backgroundLight,
      card: isDark ? colors.card : colors.cardLight,
      textPrimary: isDark ? colors.textPrimary : colors.textPrimaryLight,
      textSecondary: isDark ? colors.textSecondary : colors.textSecondaryLight,
      accent: isDark ? colors.accent : colors.accentLight,
      border: isDark ? "#333" : "#ddd",
    };
  }, [theme]);

  /* ================= HELPERS ================= */
  const fileExtension = useMemo(
    () => file.fileName.split(".").pop()?.toLowerCase() || "",
    [file.fileName]
  );

  const fileType = file.fileType || fileExtension || "Unknown";

  const formattedSize = useMemo(() => formatSize(file.fileSize), [
    file.fileSize,
  ]);

  const uploadedAt = useMemo(
    () => new Date(file.uploadedAt).toLocaleString(),
    [file.uploadedAt]
  );

  const FileIcon = useMemo(() => {
    const config = fileIcons[fileExtension] || fileIcons.default;
    return (
      <config.icon
        name={config.name as any}
        size={32}
        color={config.color}
        style={{ marginRight: 12 }}
      />
    );
  }, [fileExtension]);

  /* ================= RENDER ================= */
  return (
    <View style={[styles.container, { backgroundColor: themeColors.card }]}>
      {/* HEADER */}
      <View style={styles.header}>
        {FileIcon}

        <Text
          style={[styles.fileName, { color: themeColors.textPrimary }]}
          numberOfLines={1}
        >
          {file.fileName}
        </Text>

        <TouchableOpacity onPress={closeSheet}>
          <Ionicons
            name="close"
            size={22}
            color={themeColors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* LOADING STATE */}
      {loading ? (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: themeColors.bg },
          ]}
        >
          <AnimatedLoadingIcon
            active
            size={50}
            source={require("../../assets/lottie/Loading.json")}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <DetailRow
            label="Type"
            value={fileType}
            colors={themeColors}
          />
          <DetailRow
            label="Size"
            value={formattedSize}
            colors={themeColors}
          />
          <DetailRow
            label="Uploaded"
            value={uploadedAt}
            colors={themeColors}
          />

          {/* ACTIONS */}
          <View style={styles.actions}>
            {onPreview && (
              <ActionButton
                icon="eye"
                label="Preview"
                onPress={onPreview}
                color={themeColors.accent}
              />
            )}

            {onDownload && (
              <ActionButton
                icon="cloud-download"
                label="Download"
                onPress={onDownload}
                color={themeColors.accent}
              />
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

/* ================= SUB COMPONENTS ================= */

const DetailRow = ({ label, value, colors, loading }: any) => {
  return (
    <View style={[styles.detailRow, { borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>

      <Text
        style={[
          styles.value,
          { color: loading ? colors.textSecondary : colors.textPrimary },
        ]}
      >
        {loading ? "—" : value}
      </Text>
    </View>
  );
};

const ActionButton = ({
  icon,
  label,
  onPress,
  color,
}: any) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: color }]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={18} color="#fff" />
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

/* ================= UTILS ================= */

const formatSize = (bytes?: number) => {
  if (!bytes) return "Unknown";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  content: {
    marginTop: 16,
  },
  loadingContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginTop: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});