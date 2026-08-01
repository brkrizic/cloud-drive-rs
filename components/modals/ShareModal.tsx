import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useShareFile } from "hooks/tanstack/useSharingQuery";

type User = { id: string; name: string };

const MOCK_USERS: User[] = [
  { id: "u1", name: "Marko" },
  { id: "u2", name: "Ana" },
  { id: "u3", name: "Ivan" },
];

type Props = {
  visible: boolean;
  setShowShare: (v: boolean) => void;
  fileId: string;
};

export const ShareModal = ({ visible, setShowShare, fileId }: Props) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

  const { mutate: shareFile, isPending } = useShareFile();

  const close = () => {
    setShowShare(false);
    setSelectedUser(null);
    setSearch("");
  };

  const filteredUsers = MOCK_USERS.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const canShare = selectedUser && !isPending;

  const handleShare = () => {
    if (!selectedUser || isPending) return;

    shareFile(
      {
        fileId,
        sharedWithUserId: selectedUser.id,
      },
      {
        onSuccess: close,
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Share File</Text>

            <TouchableOpacity onPress={close}>
              <Ionicons name="close" size={22} color="#111" />
            </TouchableOpacity>
          </View>

          {/* SEARCH */}
          <TextInput
            placeholder="Search users..."
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />

          {/* USERS */}
          <ScrollView style={{ maxHeight: 220 }}>
            {filteredUsers.length === 0 ? (
              <Text style={styles.empty}>No users found</Text>
            ) : (
              filteredUsers.map((u) => {
                const active = selectedUser?.id === u.id;

                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.item, active && styles.activeItem]}
                    onPress={() => setSelectedUser(u)}
                  >
                    <Ionicons name="person-outline" size={18} />
                    <Text style={styles.text}>{u.name}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* SHARE BUTTON */}
          <TouchableOpacity
            style={[styles.button, !canShare && { opacity: 0.4 }]}
            disabled={!canShare}
            onPress={handleShare}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Share</Text>
            )}
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  search: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
  },

  activeItem: {
    backgroundColor: "#EDE9FE",
  },

  text: {
    marginLeft: 10,
  },

  button: {
    backgroundColor: "#8B5CF6",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },

  empty: {
    textAlign: "center",
    color: "#9CA3AF",
    padding: 10,
    fontSize: 12,
  },
});