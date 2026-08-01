import React, { memo, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";

type Props = {
  title?: string;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
};

function FolderHeader({ title = "", onBackPress, rightAction }: Props) {
  const { theme } = useSettings();
  const insets = useSafeAreaInsets();

  const isDark = theme === "dark";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingTop: Math.max(insets.top - 30, 10),
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isDark
            ? colors.background
            : colors.backgroundLight,
        },

        left: {
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        },

        right: {
          flexDirection: "row",
          alignItems: "center",
        },

        backButton: {
          marginRight: 10,
          padding: 6,
          borderRadius: 8,
        },

        title: {
          fontSize: 18,
          fontWeight: "700",
          flexShrink: 1,
          color: isDark
            ? colors.textPrimary
            : colors.textPrimaryLight,
        },
      }),
    [isDark, insets.top]
  );

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onBackPress && (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.right}>{rightAction}</View>
    </View>
  );
}

export default memo(FolderHeader);