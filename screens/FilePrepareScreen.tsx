import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatSize } from "utils/file";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import AnimatedLoadingIcon from "components/AnimatedLoadingIcon";
import { UploadJob } from "constants/job";

type FileItem = {
  id?: string;
  fileName: string;
  fileSize?: number;
  contentType?: string;
  thumbnailUri?: string;
  fileUri?: string;
};

type Props = {
  jobs: UploadJob[];
  setJobs: React.Dispatch<React.SetStateAction<UploadJob[]>>;
  onUpload: (jobs: UploadJob[]) => void;
  onClose: () => void;
  loading: boolean;
};

export default function FilePrepareScreen({
  jobs,
  setJobs,
  onUpload,
  onClose,
  loading,
}: Props) {
  const { theme } = useSettings();

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const splitFileName = (fileName?: string) => {
    if (!fileName) return { name: "file", ext: "" };
    const i = fileName.lastIndexOf(".");
    if (i === -1) return { name: fileName, ext: "" };
    return {
      name: fileName.slice(0, i),
      ext: fileName.slice(i),
    };
  };

  useEffect(() => {
    console.log(jobs);
  }, [jobs]);

  // -----------------------------
  // UPDATE NAME (REAL SOURCE OF TRUTH)
  // -----------------------------
  const updateName = (index: number, name: string) => {
    setJobs((prev) =>
      prev.map((job, i) => {
        if (i !== index) return job;
        const { ext } = splitFileName(job.fileName);
        return {
          ...job,
          fileName: name + ext,
        };
      })
    );
  };

  // -----------------------------
  // REMOVE FILE
  // -----------------------------
  const removeFile = (index: number) => {
    setJobs((prev) => prev.filter((_, i) => i !== index));
  };

  if (!jobs.length) return null;

  const textPrimary =
    theme === "dark" ? colors.textPrimary : colors.textPrimaryLight;
  const textSecondary =
    theme === "dark" ? colors.textSecondary : colors.textSecondaryLight;
  const accent = theme === "dark" ? colors.accent : colors.accentLight;
  const card = theme === "dark" ? colors.card : colors.cardLight;

  // -----------------------------
  // UPLOAD
  // -----------------------------
  const onUploadPress = () => {
    onUpload(jobs);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        inset: 0,
      }}
    >
      <View
        style={{
          width: "92%",
          backgroundColor: card,
          borderRadius: 24,
          padding: 20,
          maxHeight: "90%",
        }}
      >
        {/* HEADER */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: textPrimary }}>
            Upload Queue ({jobs.length})
          </Text>

          <Pressable onPress={onClose}>
            <Ionicons name="close" size={22} color={textSecondary} />
          </Pressable>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <AnimatedLoadingIcon
              source={require("../assets/lottie/DocumentLoader.json")}
            />
            <Text style={{ color: textSecondary }}>Preparing files…</Text>
          </View>
        ) : (
          <ScrollView style={{ marginTop: 20 }}>

            {jobs.map((file, index) => {
              const { ext } = splitFileName(file.fileName);
              const isExpanded = expandedIndex === index;
              const isEditing = editingIndex === index;

              return (
                <View
                  key={file.id || index}
                  style={{
                    marginBottom: 12,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor:
                      theme === "dark" ? "#1e293b" : "#f1f5f9",
                  }}
                >
                  {/* TOP */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* NAME */}
                    <View style={{ flex: 1, marginRight: 10 }}>
                      {isEditing ? (
                        <TextInput
                          value={splitFileName(file.fileName).name}
                          onChangeText={(text) => updateName(index, text)}
                          style={{
                            color: textPrimary,
                            borderBottomWidth: 1,
                            borderBottomColor: accent,
                          }}
                          autoFocus
                        />
                      ) : (
                        <Text
                          style={{ color: textPrimary, fontWeight: "600" }}
                        >
                          {file.fileName}
                        </Text>
                      )}

                      <Text style={{ color: textSecondary, fontSize: 12 }}>
                        {formatSize(file.fileSize ?? 0)}
                      </Text>
                    </View>

                    {/* ACTIONS */}
                    <View style={{ flexDirection: "row", gap: 12 }}>

                      {/* DELETE */}
                      <TouchableOpacity onPress={() => removeFile(index)}>
                        <Ionicons name="trash" size={18} color="red" />
                      </TouchableOpacity>

                      {/* EDIT */}
                      <TouchableOpacity
                        onPress={() =>
                          setEditingIndex(isEditing ? null : index)
                        }
                      >
                        <Ionicons
                          name={isEditing ? "checkmark" : "pencil"}
                          size={18}
                          color={accent}
                        />
                      </TouchableOpacity>

                      {/* EXPAND */}
                      <TouchableOpacity
                        onPress={() =>
                          setExpandedIndex(isExpanded ? null : index)
                        }
                      >
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={accent}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* EXPANDED */}
                  {isExpanded && (
                    <View style={{ marginTop: 12 }}>
                      {file.thumbnailUri && (
                        <Image
                          source={{ uri: file.thumbnailUri }}
                          style={{
                            width: "100%",
                            height: 180,
                            borderRadius: 12,
                            marginBottom: 10,
                          }}
                        />
                      )}

                      <Text style={{ color: textSecondary }}>
                        Type: {file.contentType ?? "unknown"}
                      </Text>

                      {file.fileUri && (
                        <Text
                          style={{ color: textSecondary, fontSize: 11 }}
                          numberOfLines={1}
                        >
                          {file.fileUri}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}

            {/* UPLOAD BUTTON */}
            <TouchableOpacity
              onPress={onUploadPress}
              style={{
                marginTop: 20,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: "center",
                backgroundColor: accent,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Upload {jobs.length} file(s)
              </Text>
            </TouchableOpacity>

          </ScrollView>
        )}
      </View>
    </View>
  );
}