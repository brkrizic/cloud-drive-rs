import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import { FileIcon } from "components/Fileicon";
import { FileItem } from "constants/fileItem";

interface FileGridItemProps {
  fileName: string;
  uploadedAt?: number;
  onActionPress: (item: FileItem) => void;
  style?: object;
}

export const FileGrid: React.FC<FileGridItemProps> = ({
  fileName,
  uploadedAt,
  onActionPress,
  style = {},
}) => {
  const { theme } = useSettings();
  const card = theme === "dark" ? colors.card : colors.cardLight;
  const textPrimary = theme === "dark" ? colors.textPrimary : colors.textPrimaryLight;
  const textSecondary = theme === "dark" ? colors.textSecondary : colors.textSecondaryLight;

  const screenWidth = Dimensions.get("window").width;
  const padding = 16 * 2; // horizontal padding of container
  const spacing = 12; // space between grid items
  const numColumns = 2;

  const itemWidth = (screenWidth - padding - spacing * (numColumns - 1)) / numColumns;

  return (
    <View
      style={{
        width: itemWidth,
        backgroundColor: card,
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        ...style,
      }}
    >
      <FileIcon ext={fileName.split(".").pop() || ""} size={48} />

      <Text
        style={{ color: textPrimary, fontSize: 14, marginTop: 8 }}
        numberOfLines={1}
      >
        {fileName}
      </Text>

      {uploadedAt && (
        <Text style={{ color: textSecondary, fontSize: 10, marginTop: 4 }}>
          {new Date(uploadedAt).toLocaleDateString()}
        </Text>
      )}

      <TouchableOpacity
        onPress={onActionPress}
        style={{
          padding: 6,
          borderRadius: 10,
          marginTop: 6,
          backgroundColor: theme === "dark" ? colors.background : colors.backgroundLight,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="ellipsis-vertical" size={16} color={textSecondary} />
      </TouchableOpacity>
    </View>
  );
};