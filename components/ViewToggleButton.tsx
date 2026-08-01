import { useSettings } from "context/SettingsContext";
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "constants/colors";

type Props = {
  isGrid: boolean;
  onToggle: (newState: boolean) => void;
};

export default function ViewToggleButton({ isGrid, onToggle }: Props) {
  const { theme } = useSettings();

  const bg = theme === "dark" ? colors.background : colors.backgroundLight;
  const activeBg = theme === "dark" ? colors.accent : colors.accentLight;
  const activeColor = colors.textPrimary;
  const inactiveColor = theme === "dark" ? colors.textSecondary : colors.textSecondaryLight;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <TouchableOpacity
        onPress={() => onToggle(!isGrid)}
        // style={[
        //   styles.toggleButton,
        //   { backgroundColor: isGrid ? activeBg : undefined },
        // ]}
      >
        <MaterialCommunityIcons
          name={isGrid ? "grid" : "format-list-bulleted"}
          size={20}
          color={inactiveColor}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  toggleButton: {
    padding: 4,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});