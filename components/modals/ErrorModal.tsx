import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import AnimatedLoadingIcon from "components/AnimatedLoadingIcon";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  icon?: any;
  type?: "error" | "success" | "warning" | "info";
  onClose: () => void;
  autoCloseMs?: number;
};

export default function ErrorModal({
  visible,
  title,
  message,
  icon,
  type = "error",
  onClose,
  autoCloseMs,
}: Props) {
  const { theme } = useSettings();

  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const isDark = theme === "dark";

  const bg = isDark ? colors.card : colors.cardLight;
  const textPrimary = isDark
    ? colors.textPrimary
    : colors.textPrimaryLight;
  const textSecondary = isDark
    ? colors.textSecondary
    : colors.textSecondaryLight;

  const overlay = "rgba(0,0,0,0.6)";

  // 🎨 type colors
  const accentColor =
    type === "error"
      ? "#EF4444"
      : type === "success"
      ? "#22C55E"
      : type === "warning"
      ? "#F59E0B"
      : "#3B82F6";

  // 🚀 animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoCloseMs) {
        setTimeout(onClose, autoCloseMs);
      }
    } else {
      scale.setValue(0.9);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <View
        style={{
          flex: 1,
          backgroundColor: overlay,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        {/* tap outside to close */}
        <Pressable
          onPress={onClose}
          style={{ position: "absolute", width: "100%", height: "100%" }}
        />

        <Animated.View
          style={{
            width: "100%",
            maxWidth: 340,
            backgroundColor: bg,
            borderRadius: 20,
            padding: 22,
            transform: [{ scale }],
            opacity,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* ICON */}
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <AnimatedLoadingIcon
              active
              size={60}
              source={icon ?? require("../../assets/lottie/error.json")}
            />
          </View>

          {/* TITLE */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: textPrimary,
              textAlign: "center",
            }}
          >
            {title}
          </Text>

          {/* MESSAGE */}
          {!!message && (
            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                color: textSecondary,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {message}
            </Text>
          )}

          {/* BUTTON */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={{
              marginTop: 20,
              backgroundColor: accentColor,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: 14,
              }}
            >
              OK
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}