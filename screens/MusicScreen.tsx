import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import { FileItem } from "constants/fileItem";

type MusicScreenProps = {
  files: FileItem[];
};

export default function MusicScreen({ files }: MusicScreenProps) {
    const { theme } = useSettings();

    const bg = theme === "dark" ? colors.background : colors.backgroundLight;
    const card = theme === "dark" ? colors.card : colors.cardLight;
    const textPrimary =
        theme === "dark" ? colors.textPrimary : colors.textPrimaryLight;
    const textSecondary =
        theme === "dark" ? colors.textSecondary : colors.textSecondaryLight;
    const accent = theme === "dark" ? colors.accent : colors.accentLight;

    // 🎵 ONLY AUDIO FILES
    const musicFiles = files.filter(
        (file) => file.contentType?.startsWith("audio/")
    );

    const renderItem = ({ item }: { item: FileItem }) => (
        <View style={[styles.row, { backgroundColor: card }]}>
        <Ionicons name="musical-notes-outline" size={22} color={accent} />

        <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
            style={[styles.title, { color: textPrimary }]}
            numberOfLines={1}
            >
            {item.fileName}
            </Text>

            <Text style={[styles.subtitle, { color: textSecondary }]}>
            {item.contentType?.replace("audio/", "").toUpperCase() || "AUDIO"}
            </Text>
        </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
        {/* Header */}
        <View style={styles.header}>
            <Ionicons name="musical-notes-outline" size={26} color={accent} />
            <Text style={[styles.headerTitle, { color: textPrimary }]}>
            Music
            </Text>
        </View>

        {/* Content */}
        {musicFiles.length === 0 ? (
            <View style={styles.empty}>
            <Ionicons
                name="albums-outline"
                size={48}
                color={textSecondary}
            />
            <Text style={[styles.emptyText, { color: textSecondary }]}>
                No music files yet
            </Text>
            </View>
        ) : (
            <FlatList
            data={musicFiles}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 24 }}
            />
        )}
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
});
