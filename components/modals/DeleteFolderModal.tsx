import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type Props = {
  visible: boolean;
  selectedFolder: string | undefined;
  folderId: string | undefined;
  onCancel: () => void;
  onConfirm: (folderId: string) => void;
};

export const DeleteFolderModal = ({
  visible,
  selectedFolder,
  folderId,
  onCancel,
  onConfirm,
}: Props) => {

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Delete file?</Text>

          <Text style={styles.text}>
            Are you sure you want to delete "{selectedFolder}"?
          </Text>

          {/* {deleting ? (
            <View style={styles.loading}>
              <ActivityIndicator />
              <Text style={{ marginTop: 6 }}>Deleting...</Text>
            </View>
          ) : ( */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={onCancel}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onConfirm(folderId)}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
          </View>
          {/* )} */}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20, // ensures spacing on small screens
  },

  modal: {
    width: "100%",       // full width of container
    maxWidth: 420,       // prevents it being huge on tablets
    backgroundColor: "white",
    borderRadius: 14,
    padding: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  text: {
    marginBottom: 20,
  },

  loading: {
    alignItems: "center",
    marginBottom: 15,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  cancel: {
    marginRight: 20,
    fontSize: 16,
  },

  delete: {
    color: "red",
    fontWeight: "600",
    fontSize: 16,
  },
});