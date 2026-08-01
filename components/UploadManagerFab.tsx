import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";

type Props = {
  uploadCount: number;
  onPress: () => void;
};

export default function UploadManagerFab({ uploadCount, onPress }: Props) {
    const { theme } = useSettings();

    const bg = theme === 'dark' ? colors.accent : colors.accentLight
    
    return (
        <View style={styles.container}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: bg }]} onPress={onPress}>
            <Ionicons name="cloud-upload-outline" size={14} color="white" />
        </TouchableOpacity>

        {uploadCount > 0 && (
            <View style={styles.badge}>
            <Text style={styles.badgeText}>{uploadCount}</Text>
            </View>
        )}
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 110,
    right: 80,
  },
  fab: {
    width: 36,
    height: 36,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    minWidth: 18,
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});