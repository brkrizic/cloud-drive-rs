import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView, Animated } from "react-native";
import * as Progress from "react-native-progress";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import { UploadJob } from "constants/job";
import { formatDate } from "utils/formateDate";
import { Ionicons } from "@expo/vector-icons";
import { useClearUploads, useUploadsQuery } from "hooks/tanstack/useUploadsQuery";
import { useUploadProgress } from "context/UploadProgressContext";
import { sleep } from "utils/backgroundUploadTask";

type Status = "uploading" | "completed" | "canceled" | "failed" | "pending";

type UploadSheetProps = {
  retryUpload: (job: UploadJob) => void;
  cancelUpload: (job: UploadJob) => void; 
};

const MAX_VISIBLE = 3;

export function UploadSheet({ retryUpload, cancelUpload }: UploadSheetProps) {
  const { theme } = useSettings();
  const { data: uploads = [] } = useUploadsQuery();
  const { progressMap } = useUploadProgress();
  const { mutate: clearUploads, isPending } = useClearUploads();

  const [filter, setFilter] = useState<Status>("uploading");

    // 🔥 Animated progress storage
  const animatedProgressMap = useRef<
    Record<string, Animated.Value>
  >({}).current;

  const getAnimatedValue = (id: string, value: number) => {
    if (!animatedProgressMap[id]) {
      animatedProgressMap[id] = new Animated.Value(value);
    }
    return animatedProgressMap[id];
  };

  // 🎨 theme
  const bg = theme === "dark" ? colors.card : colors.cardLight;
  const card = theme === "dark" ? colors.background : colors.backgroundLight;
  const textPrimary = theme === "dark" ? colors.textPrimary : colors.textPrimaryLight;
  const textSecondary = theme === "dark" ? colors.textSecondary : colors.textSecondaryLight;
  const accent = theme === "dark" ? colors.accent : colors.accentLight;
  const progressUnfilled = theme === "dark" ? "#334155" : "#E5E7EB";

  // 📦 group uploads
  const grouped = useMemo(() => ({
    uploading: uploads.filter(j => j.status === "uploading"),
    completed: uploads.filter(j => j.status === "completed"),
    canceled: uploads.filter(j => j.status === "canceled"),
    failed: uploads.filter(j => j.status === "failed"),
    pending: uploads.filter(j => j.status === "pending"),
  }), [uploads]);

  const counts = Object.fromEntries(
    Object.entries(grouped).map(([k, v]) => [k, v.length])
  ) as Record<Status, number>;

  const allJobs = grouped[filter];
  const displayedJobs = allJobs.slice(0, MAX_VISIBLE);
  const remainingCount = allJobs.length - MAX_VISIBLE;

  // 🧠 AUTO SWITCH LOGIC (clean + controlled)
  useEffect(() => {
    // 1. If current tab still has items → do nothing
    if (grouped[filter].length > 0) return;

    // 2. Priority order
    const priority: Status[] = [
      "uploading",
      "pending",
      "failed",
      "completed",
      "canceled",
    ];

    const next = priority.find(status => grouped[status].length > 0);

    setFilter(next ?? "uploading");
  }, [grouped, filter]);

  // 🚨 Always jump to uploading if something starts
  useEffect(() => {
    if (grouped.uploading.length > 0 && filter !== "uploading") {
      setFilter("uploading");
    }
  }, [grouped.uploading.length]);
  
    // 🔥 smooth animation sync
  useEffect(() => {
    uploads.forEach((job) => {
      const id = job.id;

      const liveProgress =
        progressMap[id] ?? job.progress ?? 0;

      const animated = getAnimatedValue(id, liveProgress);

      Animated.timing(animated, {
        toValue: liveProgress,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
  }, [progressMap, uploads]);

  const renderItem = ({ item }: { item: UploadJob }) => {
    const liveProgress = progressMap[item.id];
    const progressValue = liveProgress ?? item.progress ?? 0;

    const animatedValue = getAnimatedValue(
      item.id,
      progressMap[item.id] ?? item.progress ?? 0
    );

    const width = animatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: ["0%", "100%"],
    });


    return (
      <View
        style={{
          padding: 12,
          marginBottom: 10,
          borderRadius: 10,
          backgroundColor: card,
        }}
      >
        {/* header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{ flex: 1, color: textPrimary, fontWeight: "600" }}
            numberOfLines={1}
          >
            {item.fileName}
          </Text>

          {item.status === "completed" && (
            <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
          )}
          {item.status === "failed" && (
            <Ionicons name="close-circle" size={22} color="#ef4444" />
          )}
          {item.status === "uploading" && (
            <Ionicons name="cloud-upload" size={22} color={accent} />
          )}
          {item.status === "pending" && (
            <Ionicons name="time" size={22} color="#f59e0b" />
          )}
          {item.status === "canceled" && (
            <Ionicons name="close-circle-outline" size={25} color="#64748b" />
          )}
        </View>

        {/* meta */}
        <Text style={{ color: textSecondary }}>Status: {item.status}</Text>
        <Text style={{ color: textSecondary }}>
          Created: {formatDate(item.createdAt)}
        </Text>

        {/* progress */}
        {item.status === "uploading" && (
          <>
            {/* <Progress.Bar
              progress={progressValue / 100}
              width={null}
              height={8}
              color={accent}
              unfilledColor={progressUnfilled}
              borderWidth={0}
            />
            <Text style={{ color: textSecondary, textAlign: "right" }}>
              {progressValue.toFixed(0)}%
            </Text> */}
                    {/* PROGRESS (SMOOTH) */}
        {item.status === "uploading" && (
          <>
            <View
              style={{
                height: 8,
                backgroundColor: progressUnfilled,
                borderRadius: 6,
                overflow: "hidden",
                marginTop: 6,
              }}
            >
              <Animated.View
                style={{
                  height: "100%",
                  width,
                  backgroundColor: accent,
                }}
              />
            </View>

            <Text
              style={{
                color: textSecondary,
                textAlign: "right",
              }}
            >
              {progressMap[item.id] ?? item.progress ?? 0}%
            </Text>
          </>
        )}
          </>
        )}

        {/* failed actions */}
        {item.status === "failed" && (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <TouchableOpacity onPress={() => retryUpload(item)}>
              <Text style={{ color: accent }}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => cancelUpload(item)}>
              <Text style={{ color: "#ef4444" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const statusButtons: Status[] = [
    "pending",
    "uploading",
    "completed",
    "failed",
    "canceled",
  ];

  const Footer = () => {
    if (remainingCount <= 0) return null;

    return (
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <Text style={{ color: textSecondary }}>
          + {remainingCount} more
        </Text>
      </View>
    );
  };

  return (
    <View style={{ padding: 20, flex: 1, backgroundColor: bg }}>

      {/* clear */}
      <TouchableOpacity
        onPress={() => clearUploads()}
        style={{ alignSelf: "center", marginBottom: 20 }}
      >
        <Text style={{ color: "#ef4444" }}>
          {isPending ? "Clearing..." : "Clear tracking history"}
        </Text>
      </TouchableOpacity>

      {/* filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {statusButtons.map((status) => {
          const isActive = filter === status;
          const isDisabled = counts[status] === 0;

          return (
            <TouchableOpacity
              key={status}
              disabled={isDisabled}
              onPress={() => setFilter(status)}
              style={{ marginRight: 12 }}
            >
              <Text
                style={{
                  color: isDisabled
                    ? "#64748b"
                    : isActive
                    ? accent
                    : textSecondary,
                  fontWeight: isActive ? "700" : "500",
                }}
              >
                {status.charAt(0).toLocaleUpperCase() + status.slice(1)} ({counts[status]})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* list */}
      {displayedJobs.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 70,
          }}
        >
          <Ionicons name="cloud-offline-outline" size={48} color={textSecondary} />

          <Text
            style={{
              marginTop: 10,
              color: textPrimary,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            No uploads
          </Text>

          <Text
            style={{
              marginTop: 6,
              color: textSecondary,
              fontSize: 13,
              textAlign: "center",
              paddingHorizontal: 20,
            }}
          >
            Upload files will appear here once you start uploading.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedJobs.toReversed()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 40 }}
          ListFooterComponent={Footer}
        />
      )}
    </View>
  );
}