import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "context/SettingsContext";
import { Text, TouchableOpacity, View } from "react-native";

export const FolderItem = ({ item, onPress, onDelete, onRename }) => {
  const { theme } = useSettings();

  const getSyncColor = () => {
    switch (item.syncStatus) {
      case "syncing":
        return "#f59e0b"; // amber
      case "synced":
        return "#22c55e"; // green
      case "failed":
        return "#ef4444"; // red
      default:
        return "#94a3b8"; // gray
    }
  };

  const getSyncLabel = () => {
    switch (item.syncStatus) {
      case "syncing":
        return "Syncing...";
      case "synced":
        return "Synced";
      case "failed":
        return "Sync failed";
      default:
        return "Local";
    }
  };

  const syncColor = getSyncColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,

        borderWidth: theme === "dark" ? 0 : 1,
        borderColor: "#e5e7eb",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        
        {/* 📁 ICON */}
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: "rgba(34,197,94,0.15)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="folder" size={20} color="#22c55e" />
        </View>

        {/* 📄 TEXT */}
        <View style={{ flex: 1 }}>
          
          <Text
            style={{
              color: theme === "dark" ? "#fff" : "#111827",
              fontSize: 15,
              fontWeight: "700",
            }}
            numberOfLines={1}
          >
            {item.folderName}
          </Text>

          {/* ITEMS + SYNC STATUS */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>
              {item.fileCount ?? 0} items
            </Text>

            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: "#94a3b8",
                marginHorizontal: 6,
              }}
            />

            <Text style={{ color: syncColor, fontSize: 12, fontWeight: "600" }}>
              {getSyncLabel()}
            </Text>
          </View>
        </View>

        {/* ⚙️ ACTIONS */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>

          {/* ✏️ Rename */}
          <TouchableOpacity
            onPress={() => onRename?.(item.folderId, item.folderName)}
            style={{ padding: 6 }}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={theme === "dark" ? "#fff" : "#111827"}
            />
          </TouchableOpacity>

          {/* ⋯ Delete */}
          <TouchableOpacity
            onPress={() => onDelete?.(item.folderId, item.folderName)}
            style={{ padding: 6 }}
          >
            <Ionicons
              name="trash"
              size={20}
              color={theme === "dark" ? "#fff" : "#111827"}
            />
          </TouchableOpacity>

        </View>
      </View>
    </TouchableOpacity>
  );
};