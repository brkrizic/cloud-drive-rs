import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import { FileIcon } from "components/Fileicon";

interface FileRowProps {
  fileName: string;
  uploadedAt?: number;
  lastViewedAt?: number;
  lastViewedBy?: string;

  isUploading?: boolean;
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "failed";

  onActionPress: () => void;
}

export const formatTimeAgo = (timestamp: number) => {
  const diff = Date.now() - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};

export const FileRow: React.FC<FileRowProps> = ({
  fileName,
  uploadedAt,
  lastViewedAt,
  lastViewedBy,

  isUploading = false,
  uploadProgress = 0,
  uploadStatus,

  onActionPress,
}) => {
  const { theme } = useSettings();

  const card = theme === "dark" ? colors.card : colors.cardLight;
  const textPrimary =
    theme === "dark" ? colors.textPrimary : colors.textPrimaryLight;
  const textSecondary =
    theme === "dark" ? colors.textSecondary : colors.textSecondaryLight;
  const accent =
    theme === "dark" ? colors.accent : colors.accentLight;

  const isRecent =
    lastViewedAt && Date.now() - lastViewedAt < 1000 * 60 * 60;

  return (
    <View
      style={{
        backgroundColor: card,
        borderRadius: 18,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 6,
      }}
    >
      {/* ICON */}
      <FileIcon ext={fileName?.split(".").pop() || ""} />

      {/* CONTENT */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        {/* NAME */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              flex: 1,
            }}
            numberOfLines={1}
          >
            {fileName}
          </Text>

          {isRecent && (
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#4ade80",
                marginLeft: 6,
              }}
            />
          )}
        </View>

        {/* PRIMARY META (clean line) */}
        {isUploading ? (
          <Text
            style={{
              color:
                uploadStatus === "failed"
                  ? "#ef4444"
                  : uploadStatus === "pending"
                  ? "#f59e0b"
                  : accent,
              fontSize: 11,
              marginTop: 4,
              fontWeight: "600",
            }}
          >
            {uploadStatus === "pending" &&
              "Waiting for upload..."}

            {uploadStatus === "uploading" &&
              `Uploading ${uploadProgress}%`}

            {uploadStatus === "failed" &&
              "Upload failed"}
          </Text>
        ) : (
          <Text
            style={{
              color: textSecondary,
              fontSize: 11,
              marginTop: 4,
            }}
            numberOfLines={1}
          >
            {lastViewedAt
              ? `Last opened ${formatTimeAgo(lastViewedAt)}${
                  lastViewedBy ? ` • ${lastViewedBy}` : ""
                }`
              : uploadedAt
              ? `Uploaded ${new Date(
                  uploadedAt
                ).toLocaleDateString()}`
              : ""}
          </Text>
        )}

        {isUploading &&
          uploadStatus === "uploading" && (
            <View
              style={{
                height: 4,
                backgroundColor: "#334155",
                borderRadius: 4,
                overflow: "hidden",
                marginTop: 6,
              }}
            >
              <View
                style={{
                  width: `${uploadProgress}%`,
                  height: "100%",
                  backgroundColor: accent,
                }}
              />
            </View>
        )}

        {/* SECONDARY META (subtle hint only if needed) */}
        {uploadedAt && lastViewedAt && (
          <Text
            style={{
              color: textSecondary,
              fontSize: 10,
              opacity: 0.6,
              marginTop: 2,
            }}
          >
            Uploaded {new Date(uploadedAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* ACTION */}
      <TouchableOpacity
        onPress={onActionPress}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={textSecondary} />
      </TouchableOpacity>
    </View>
  );
};