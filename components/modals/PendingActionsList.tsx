import { ActionType } from "constants/actionType";
import { getPendingActions } from "database/actionRepo";
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export type ActionItem = {
  id: string;
  type: string;
  payload: string;
  status: "pending" | "failed" | "synced";
  retryCount: number;
  createdAt: number;
  updatedAt?: number;
};

type Props = {
  actions: ActionItem[];
};

const getStatusColor = (status: ActionItem["status"]) => {
  switch (status) {
    case "pending":
      return "#f59e0b"; // amber
    case "failed":
      return "#ef4444"; // red
    case "synced":
      return "#22c55e"; // green
    default:
      return "#6b7280";
  }
};

export const PendingActionsList = () => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActions = async () => {
      setLoading(true);

      const result = await getPendingActions();
      setActions(result);

      setLoading(false);
    };

    fetchActions();
  }, []);

  if (loading) {
  return (
    <View style={styles.container}>
      <Text style={{ color: "white" }}>Loading...</Text>
    </View>
  );
}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sync Queue</Text>

      <FlatList
        data={actions ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.type}>{item.type}</Text>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.payload} numberOfLines={2}>
              {item.payload}
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.meta}>
                retries: {item.retryCount}
              </Text>

              <Text style={styles.meta}>
                {new Date(item.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0f172a", // dark app feel
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  type: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  statusText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
  },

  payload: {
    color: "#9ca3af",
    marginTop: 6,
    fontSize: 12,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  meta: {
    color: "#6b7280",
    fontSize: 11,
  },
});