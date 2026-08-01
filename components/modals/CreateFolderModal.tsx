import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

type Props = {
  setShowCreateFolder: (value: boolean) => void;
  handleCreateFolder: (val1: string, val2: string) => void;
  parentFolderId?: string | null;
};

const CreateFolderModal = ({
  setShowCreateFolder,
  handleCreateFolder,
  parentFolderId = null,
}: Props) => {
  const [folderName, setFolderName] = useState("");


  const close = () => {
    setShowCreateFolder(false);
    setFolderName("");
  };


  const canCreate = folderName?.trim()?.length > 0;

  return (
    <View style={styles.overlay}>
      <View style={styles.modalBox}>

        {/* TITLE */}
        <Text style={styles.modalTitle}>New Folder</Text>

        {/* INPUT */}
        <TextInput
          value={folderName}
          onChangeText={setFolderName}
          placeholder="Folder name"
          style={styles.input}
        />

        {/* ACTIONS */}
        <View style={styles.modalActions}>

          <TouchableOpacity onPress={close}>
            <Text style={{ color: "#6B7280" }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleCreateFolder(folderName, parentFolderId);
              setShowCreateFolder(false);
            }}
            disabled={!canCreate}
            style={[styles.createBtn, !canCreate && { opacity: 0.4 }]}
          >

            <Text style={styles.createText}>Create</Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
};

export default CreateFolderModal;

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

  createBtn: {
    backgroundColor: "#22C55E", // green (modern Tailwind green)
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  createText: {
    color: "#fff",
    fontWeight: "700",
  },
});