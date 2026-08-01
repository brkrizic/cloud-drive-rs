import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { useUploadUrl } from "hooks/useUploadUrl";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import { Job } from "constants/job";
import { v4 as uuidv4 } from 'uuid';
import { getUploadUrl } from "services/fileService";

type TextUploaderProps = {
  uploaderVisible: boolean;
  onClose: () => void;
  onUploaded?: () => void;
  setIsText: React.Dispatch<React.SetStateAction<boolean>>
  setTitle: React.Dispatch<React.SetStateAction<string>>
  setDescription: React.Dispatch<React.SetStateAction<string>>
  title: string;
  description: string;
  setCurrentJob: React.Dispatch<React.SetStateAction<Job>>
};

export default function TextUploaderModal({
  uploaderVisible,
  onClose,
  onUploaded,
  setIsText,
  setTitle,
  setDescription,
  title,
  description,
  setCurrentJob
}: TextUploaderProps) {
  const { theme } = useSettings();
  const [loading, setLoading] = useState(false);

  // Theme-aware colors
  const bgOverlay =
    theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.25)";
  const card = theme === "dark" ? colors.card : colors.cardLight;
  const textPrimary =
    theme === "dark" ? colors.textPrimary : colors.textPrimaryLight;
  const textSecondary =
    theme === "dark" ? colors.textSecondary : colors.textSecondaryLight;
  const accent = theme === "dark" ? colors.accent : colors.accentLight;
  const inputBg = theme === "dark" ? "#111827" : "#F9FAFB";
  const inputBorder = theme === "dark" ? "#374151" : "#D1D5DB";

  const handleConfirmText = async () => {
    if (!title.trim() || !description.trim()) return;

    const fileName = title.trim().endsWith('.txt') ? title.trim() : `${title.trim()}.txt`;
    const fileSize = new TextEncoder().encode(description).length;

    const { data } = await getUploadUrl({
      fileName,
      fileSize,
      contentType: 'text/plain',
    });

    if (!data?.uploadUrl) {
      console.error("Failed to fetch upload URL for text");
      return;
    }

    const job: Job = {
      id: uuidv4(),
      uploadId: '',
      fileName: title.trim() + '.txt',
      fileUri: '',           // no file for text
      fileSize: new TextEncoder().encode(description).length,
      contentType: 'text/plain',
      s3Key: `uploads/${Date.now()}-${title.trim()}.txt`,
      uploadUrl: data.uploadUrl,         // will fetch later
      status: 'pending',
      progress: 0,
      createdAt: Date.now(),
      isText: true,
      title,
      description,
    };

    setCurrentJob(job);   // parent now has a full Job object
    // onUploaded?.();
    onClose();
  };

  return (
    <Modal
      visible={uploaderVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Pressable
        style={[styles.overlay, { backgroundColor: bgOverlay }]}
        onPress={onClose}
      >
        {/* Prevent closing when tapping modal */}
        <Pressable onPress={() => {}}>
          <View style={[styles.modalContainer, { backgroundColor: card }]}>
            <Text style={[styles.title, { color: textPrimary }]}>
              New Text Document
            </Text>

            {/* Title input */}
            <TextInput
              style={[
                styles.titleInput,
                {
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: textPrimary,
                },
              ]}
              placeholder="Document title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={textSecondary}
            />

            {/* Text input */}
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: textPrimary,
                },
              ]}
              multiline
              placeholder="Type your text here..."
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={textSecondary}
              textAlignVertical="top"
            />

            {loading && (
              <ActivityIndicator
                size="large"
                color={accent}
                style={{ marginVertical: 16 }}
              />
            )}

            {/* Buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      loading || !description.trim() ? textSecondary : accent,
                  },
                ]}
                onPress={handleConfirmText}
                disabled={loading || !description.trim()}
              >
                <Text style={styles.buttonText}>Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: textSecondary },
                ]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: card }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  titleInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  textInput: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  buttonText: {
    fontWeight: "600",
    color: "#FFF",
  },
});
