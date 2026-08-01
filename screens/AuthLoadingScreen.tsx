import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import type { AuthState } from "hooks/useAuth";

const MIN_TIME = 3000;

type Props = {
  authState: AuthState;
};

export default function AuthLoadingScreen({ authState }: Props) {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const bgGradient = isDark
    ? ["#0B1220", "#0F172A", "#0B0F1A"]
    : ["#F8FAFC", "#E2E8F0"];

  const textPrimary = isDark
    ? colors.textPrimary
    : colors.textPrimaryLight;

  const textSecondary = isDark
    ? colors.textSecondary
    : colors.textSecondaryLight;

  const accent = isDark ? colors.accent : colors.accentLight;

  // -------------------------
  // BOOT STAGES
  // -------------------------
  const stages = [
    "Checking session...",
    "Verifying credentials...",
    "Decrypting secure vault...",
    "Syncing user data...",
    "Preparing workspace...",
  ];

  const [stageIndex, setStageIndex] = useState(0);

  // -------------------------
  // ANIMATIONS
  // -------------------------
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(1)).current;

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // -------------------------
  // MAIN EFFECT
  // -------------------------
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const start = async () => {
      const startTime = Date.now();

      // ENTRY ANIMATION
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();

      // GLOW LOOP
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // STAGES LOOP
      interval = setInterval(() => {
        Animated.sequence([
          Animated.timing(textAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(textAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        setStageIndex((prev) => (prev + 1) % stages.length);
      }, 800);

      // MIN TIME (smooth UX)
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_TIME) {
        await wait(MIN_TIME - elapsed);
      }
    };

    start();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // -------------------------
  // GLOW MOVEMENT
  // -------------------------
  const glow1 = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 10],
  });

  const glow2 = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -10],
  });

  return (
    <LinearGradient colors={bgGradient} style={styles.container}>

      {/* GLOW ORBS */}
      <Animated.View
        style={[
          styles.glow,
          {
            top: -120,
            left: -80,
            transform: [{ translateY: glow1 }],
            backgroundColor: "rgba(16,185,129,0.15)",
          },
        ]}
      />

      <Animated.View
        style={[
          styles.glow,
          {
            bottom: -120,
            right: -80,
            transform: [{ translateY: glow2 }],
            backgroundColor: "rgba(59,130,246,0.12)",
          },
        ]}
      />

      {/* CONTENT */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >

        {/* TITLE */}
        <Text style={[styles.title, { color: textPrimary }]}>
          Stashr
        </Text>

        {/* BOOT TEXT */}
        <Animated.Text
          style={[
            styles.stage,
            {
              color: textSecondary,
              opacity: textAnim,
            },
          ]}
        >
          {stages[stageIndex]}
        </Animated.Text>

        {/* LOADER */}
        <View style={styles.loader}>
          <View style={[styles.dot, { backgroundColor: accent }]} />
          <View style={[styles.dot, { backgroundColor: accent, opacity: 0.6 }]} />
          <View style={[styles.dot, { backgroundColor: accent, opacity: 0.3 }]} />
        </View>

      </Animated.View>
    </LinearGradient>
  );
}

// -------------------------
// STYLES
// -------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  content: {
    alignItems: "center",
  },

  title: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: 2,
  },

  stage: {
    marginTop: 10,
    fontSize: 14,
    opacity: 0.9,
  },

  loader: {
    flexDirection: "row",
    marginTop: 24,
    alignItems: "center",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },

  glow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
  },
});