import { useSettings } from "context/SettingsContext";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "constants/colors";
import { FileFilters } from "hooks/useFileFilterSort";
import { useFileQuery } from "context/FileQueryContext";

type Category = {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons;
};

type CategorySelectorProps = {
  toggleFilter: (key: keyof FileFilters) => void;
}

// Default order
const defaultCategories: Category[] = [
  { id: "1", name: "Photos", icon: "image" },
  { id: "2", name: "Videos", icon: "video" },
  { id: "3", name: "Audio", icon: "music-note" },
  { id: "4", name: "Documents", icon: "file-document-outline" },
  { id: "5", name: "Large files", icon: "download" },
  { id: "6", name: "This week", icon: "calendar-week" },
];

export default function CategorySelector({ toggleFilter }: CategorySelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const { theme } = useSettings();

  const handleSelect = (id: string, key: keyof FileFilters) => {
    setSelectedIds(prev => {
      let newSelected: string[];
      if (prev.includes(id)) {
        newSelected = prev.filter(x => x !== id); // deselect
      } else {
        newSelected = [...prev, id]; // select
      }
      return newSelected;
    });

    // 🔹 Trigger parent filter toggle
    toggleFilter(key);
  };

  const categoryKeys: Record<string, keyof FileFilters> = {
    "1": "photos",
    "2": "videos",
    "3": "audio",
    "4": "documents",
    "5": "largeFiles",
    "6": "thisWeek",
  };

  const orderedCategories = [
    ...selectedIds.map(id => defaultCategories.find(c => c.id === id)!),
    ...defaultCategories.filter(c => !selectedIds.includes(c.id)),
  ];

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    });

    return () => cancelAnimationFrame(raf);
}, [orderedCategories]);


  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? colors.background : colors.backgroundLight, height: 60 },
      ]}
    >
      <FlatList
        horizontal
        ref={flatListRef}
        data={orderedCategories}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  // opacity: isLoading ? 0.5 : 1,
                  backgroundColor: isSelected
                    ? theme === "dark"
                      ? colors.accent
                      : colors.accentLight
                    : theme === "dark"
                    ? colors.card
                    : colors.cardLight,
                  flexDirection: "row",
                  alignItems: "center",
                },
              ]}
              onPress={() => handleSelect(item.id, categoryKeys[item.id])}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={18}
                color={
                  isSelected
                    ? colors.textPrimary
                    : theme === "dark"
                    ? colors.textSecondary
                    : colors.textSecondaryLight
                }
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: isSelected
                    ? colors.textPrimary
                    : theme === "dark"
                    ? colors.textSecondary
                    : colors.textSecondaryLight,
                  fontWeight: isSelected ? "700" : "500",
                  fontSize: 12,
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingVertical: 13,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginHorizontal: 5,
  },
});
