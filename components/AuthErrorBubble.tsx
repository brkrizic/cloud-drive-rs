import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Pressable } from "react-native";

type Props = {
  message: string | null;
  onHide: () => void;
};

export default function AuthErrorBubble({ message, onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (!message) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, 3500);

    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable onPress={onHide} style={styles.inner}>
        <Text style={styles.title}>Authentication Error</Text>
        <Text style={styles.message}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  inner: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    padding: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    color: "#f87171",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 4,
  },
  message: {
    color: "#e5e7eb",
    fontSize: 13,
  },
});