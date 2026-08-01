import React, { useEffect, useState } from "react";
import { View, Image, Text, Pressable, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import FileInfoSheet from "./modals/FileInfoSheet";
import { useBottomSheet } from "context/BottomSheetContext";

type Props = {
  uri: string;
  file: any;
};

const GalleryItemPreview: React.FC<Props> = ({ uri, file }) => {
  const [showActionBtns, setShowActionBtns] = useState(false);
  const { theme } = useSettings();
  const { openSheet } = useBottomSheet();
  const { width, height } = useWindowDimensions(); // responsive dimensions

  useEffect(() => {
    setShowActionBtns(false);
  }, [uri]);

  const bg = theme === "dark" ? colors.background : colors.backgroundLight;
  const textPrimary = theme === "dark" ? colors.textPrimary : colors.textPrimaryLight;
  const accent = theme === "dark" ? colors.accent : colors.accentLight;
  const danger = theme === "dark" ? colors.textError : colors.textErrorLight;

  return (
    <View className="relative items-center justify-center" style={{ flex: 1, width, height }}>
      
      {/* Image */}
      <Pressable
        className="absolute inset-0 m-5 mt-0"
        onPress={() => setShowActionBtns(v => !v)}
      >
        <Image
          source={{ uri }}
          resizeMode="contain"
          style={{
            width: "100%",
            height: "100%",
            maxWidth: width,
            maxHeight: height,
          }}
        />
      </Pressable>

      {/* Action Buttons */}
      {showActionBtns && (
        <View
          className="absolute top-4 left-0 right-0 flex-row justify-evenly items-center py-3"
          style={{
            backgroundColor: bg,
          }}
        >
          <Action icon="download-outline" label="Download" color={accent} />
          <Action
            icon="information-circle-outline"
            label="Info"
            color={textPrimary}
            onPress={() => openSheet(<FileInfoSheet file={file} />)}
          />
          <Action icon="trash-outline" label="Delete" danger color={danger} />
        </View>
      )}
    </View>
  );
};

const Action = ({
  icon,
  label,
  danger,
  color,
  onPress,
}: {
  icon: any;
  label: string;
  danger?: boolean;
  color: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity className="items-center gap-1" onPress={onPress}>
    <Ionicons name={icon} size={22} color={color} />
    <Text className="text-xs" style={{ color }}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default GalleryItemPreview;
