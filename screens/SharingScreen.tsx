import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";

import {
  useSharedByMe,
  useSharedWithMe,
} from "hooks/tanstack/useSharingQuery";
import AnimatedLoadingIcon from "components/AnimatedLoadingIcon";

export const SharingScreen = () => {
  const { theme } = useSettings();

  const isDark = theme === "dark";

  const [filter, setFilter] = useState("all");

  const themeColors = useMemo(
    () => ({
      background: isDark
        ? colors.background
        : colors.backgroundLight,

      card: isDark
        ? colors.card
        : colors.cardLight,

      surface: isDark
        ? colors.cardHover
        : colors.surfaceLight,

      textPrimary: isDark
        ? colors.textPrimary
        : colors.textPrimaryLight,

      textSecondary: isDark
        ? colors.textSecondary
        : colors.textSecondaryLight,

      accent: isDark
        ? colors.accent
        : colors.accentLight,

      border: isDark
        ? "rgba(255,255,255,0.05)"
        : "rgba(15,23,42,0.06)",
      sharing: isDark
        ? "#A855F7"
        : "#9333EA",

      sharingSoft: isDark
        ? "rgba(168,85,247,0.16)"
        : "rgba(147,51,234,0.10)",

      sharingBorder: isDark
        ? "rgba(168,85,247,0.28)"
        : "rgba(147,51,234,0.18)",
    }),
    [isDark]
  );

  const styles = useMemo(
    () => createStyles(themeColors, isDark),
    [themeColors, isDark]
  );

  const {
    data: received = [],
    isLoading: loadingReceived,
  } = useSharedWithMe();

  const {
    data: sent = [],
    isLoading: loadingSent,
  } = useSharedByMe();

  const isLoading =
    loadingReceived || loadingSent;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
      />

      {/* TABS */}
      <View style={styles.tabs}>
        {["all", "received", "sent"].map(
          (tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setFilter(tab)}
              style={[
                styles.tab,
                filter === tab &&
                  styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  filter === tab &&
                    styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* LOADING */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={themeColors.accent}
          />

          <AnimatedLoadingIcon active={true} size={50} source={require('../assets/lottie/Loading.json')}/>

          <Text style={styles.loadingText}>
            Loading shares...
          </Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
          data={[
            ...(filter !== "sent"
              ? [{ type: "received" }]
              : []),

            ...(filter !== "received"
              ? [{ type: "sent" }]
              : []),
          ]}
          keyExtractor={(item, index) =>
            item.type + index
          }
          renderItem={({ item }) => {
            if (item.type === "received") {
              return (
                <Section
                  title="Shared with you"
                  data={received}
                  mode="received"
                  styles={styles}
                  themeColors={themeColors}
                />
              );
            }

            return (
              <Section
                title="Shared by you"
                data={sent}
                mode="sent"
                styles={styles}
                themeColors={themeColors}
              />
            );
          }}
        />
      )}
    </View>
  );
};

// =====================================
// SECTION
// =====================================

const Section = ({
  title,
  data,
  mode,
  styles,
  themeColors,
}) => {
  if (!data?.length) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="folder-open-outline"
          size={34}
          color={themeColors.textSecondary}
        />

        <Text style={styles.emptyTitle}>
          No shares found
        </Text>

        <Text style={styles.emptySubtitle}>
          Shared files will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {data.map((item) => (
        <UserCard
          key={item.shareId}
          item={item}
          mode={mode}
          styles={styles}
          themeColors={themeColors}
        />
      ))}
    </View>
  );
};

// =====================================
// CARD
// =====================================

const UserCard = ({
  item,
  mode,
  styles,
  themeColors,
}) => {
  const file = item.file;

  const user =
    mode === "received"
      ? item.owner
      : item.sharedWithUser;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
    >
      <View
        style={[
          styles.cardAccent,
          {
            backgroundColor:
              mode === "received"
                ? "#10B981"
                : themeColors.accent,
          },
        ]}
      />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Ionicons
              name={
                mode === "received"
                  ? "arrow-down"
                  : "arrow-up"
              }
              size={16}
              color="#fff"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>
              {user?.username ||
                "Unknown user"}
            </Text>

            <Text style={styles.activityText}>
              {mode === "received"
                ? "Shared with you"
                : "You shared this"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.moreBtn}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={18}
              color={
                themeColors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>

        <View style={styles.fileContainer}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={themeColors.accent}
          />

          <View
            style={{
              flex: 1,
              marginLeft: 10,
            }}
          >
            <Text
              style={styles.fileTitle}
              numberOfLines={1}
            >
              {file?.fileName ||
                "Unknown file"}
            </Text>

            <Text style={styles.fileMeta}>
              {file?.fileType || "file"} •{" "}
              {file?.fileSize
                ? `${Math.round(
                    file.fileSize / 1024
                  )} KB`
                : ""}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// =====================================
// STYLES
// =====================================

const createStyles = (
  themeColors,
  isDark
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        themeColors.background,

      paddingHorizontal: 16,
      paddingTop: 10,
    },

    tabs: {
      flexDirection: "row",

      backgroundColor:
        themeColors.surface,

      borderRadius: 20,

      padding: 5,

      marginBottom: 20,
    },

    tab: {
      flex: 1,

      alignItems: "center",

      paddingVertical: 10,

      borderRadius: 16,
    },

    tabActive: {
      backgroundColor:
        themeColors.card,

      shadowColor: "#000",

      shadowOpacity: isDark
        ? 0.25
        : 0.08,

      shadowRadius: 10,

      elevation: 3,
    },

    tabText: {
      color:
        themeColors.textSecondary,

      fontWeight: "600",

      fontSize: 13,

      textTransform: "capitalize",
    },

    tabTextActive: {
      color:
        themeColors.textPrimary,
    },

    section: {
      marginBottom: 24,
    },

    sectionTitle: {
      fontSize: 13,

      fontWeight: "700",

      letterSpacing: 0.5,

      textTransform: "uppercase",

      color:
        themeColors.textSecondary,

      marginBottom: 12,

      marginLeft: 4,
    },

    card: {
      flexDirection: "row",

      backgroundColor:
        themeColors.card,

      borderRadius: 24,

      padding: 16,

      marginBottom: 14,

      borderWidth: 1,

      borderColor:
        themeColors.border,

      shadowColor: "#000",

      shadowOpacity: isDark
        ? 0.2
        : 0.05,

      shadowRadius: 16,

      elevation: 4,
    },

    cardAccent: {
      width: 5,

      borderRadius: 999,

      marginRight: 14,
    },

    cardContent: {
      flex: 1,
    },

    cardHeader: {
      flexDirection: "row",

      alignItems: "center",
    },

    avatar: {
      width: 42,
      height: 42,

      borderRadius: 21,

      justifyContent: "center",
      alignItems: "center",

      backgroundColor:
        themeColors.accent,

      marginRight: 12,
    },

    userName: {
      fontSize: 15,

      fontWeight: "700",

      color:
        themeColors.textPrimary,
    },

    activityText: {
      marginTop: 2,

      fontSize: 12,

      color:
        themeColors.textSecondary,
    },

    moreBtn: {
      width: 36,
      height: 36,

      borderRadius: 18,

      justifyContent: "center",
      alignItems: "center",

      backgroundColor:
        themeColors.surface,
    },

    fileContainer: {
      flexDirection: "row",

      alignItems: "center",

      marginTop: 14,

      backgroundColor:
        themeColors.surface,

      borderRadius: 16,

      padding: 12,
    },

    fileTitle: {
      fontSize: 14,

      fontWeight: "600",

      color:
        themeColors.textPrimary,
    },

    fileMeta: {
      marginTop: 3,

      fontSize: 12,

      color:
        themeColors.textSecondary,
    },

    loadingContainer: {
      marginTop: 80,

      alignItems: "center",
    },

    loadingText: {
      marginTop: 12,

      color:
        themeColors.textSecondary,

      fontSize: 13,
    },

    emptyState: {
      marginTop: 60,

      alignItems: "center",
    },

    emptyTitle: {
      marginTop: 14,

      fontSize: 16,

      fontWeight: "700",

      color:
        themeColors.textPrimary,
    },

    emptySubtitle: {
      marginTop: 6,

      fontSize: 13,

      color:
        themeColors.textSecondary,
    },
  });