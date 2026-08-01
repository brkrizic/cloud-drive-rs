import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

type Props = {
  folderId: string;
  currentFolderName: string;
  setShowRenameFolderModal: (value: boolean) => void;
  onCancel: () => void;
  onConfirm: (folderId: string, folderName: string) => void;
};

const RenameFolderModal = ({
  folderId,
  currentFolderName,
  onCancel,
  onConfirm
}: Props) => {
  const [folderName, setFolderName] = useState(currentFolderName);

  const canRename =
    folderName.trim().length > 0 &&
    folderName.trim() !== currentFolderName.trim();

  return (
    <View style={styles.overlay}>
      <View style={styles.modalBox}>
        {/* TITLE */}
        <Text style={styles.modalTitle}>Rename Folder</Text>

        {/* INPUT */}
        <TextInput
          value={folderName}
          onChangeText={setFolderName}
          placeholder="Folder name"
          style={styles.input}
          autoFocus
        />

        {/* ACTIONS */}
        <View style={styles.modalActions}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={{ color: "#6B7280" }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onConfirm(folderId, folderName.trim())}
            disabled={!canRename}
            style={[styles.renameBtn, !canRename && { opacity: 0.4 }]}
          >
            <Text style={styles.renameText}>Rename</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RenameFolderModal;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  renameBtn: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  renameText: {
    color: "#fff",
    fontWeight: "700",
  },
});