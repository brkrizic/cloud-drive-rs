import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TextInput,
  Pressable,
  Animated,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";

type Props = {
  value: string;
  onChange: (text: string) => void;
  onClear?: () => void;
};

export default function SearchBar({ value, onChange, onClear }: Props) {
  const { theme } = useSettings();

  const inputRef = useRef<TextInput>(null);

  const [focused, setFocused] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const hints = ["Stashr", "Search in Stashr"];

  const anim = useRef(new Animated.Value(0)).current;
  const placeholderAnim = useRef(new Animated.Value(1)).current;

  const bg = theme === "dark" ? colors.card : colors.cardLight;

  const textColor =
    theme === "dark"
      ? colors.textPrimary
      : colors.textPrimaryLight;

  const placeholderColor =
    theme === "dark"
      ? colors.textSecondary
      : colors.textSecondaryLight;

  const borderDefault = theme === "dark" ? "#1e293b" : "#E2E8F0";
  const borderActive = "#3b82f6";

  // placeholder loop
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(placeholderAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setHintIndex((prev) => (prev + 1) % hints.length);

        Animated.timing(placeholderAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const onFocus = () => {
    setFocused(true);

    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const onBlur = () => {
    setFocused(false);

    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [borderDefault, borderActive],
  });

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const handleOutsidePress = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
  };

  return (
    <View style={{ marginBottom: focused ? 10 : 16 }}>

      {/* BACKDROP */}
      {focused && (
        <Pressable
          onPress={handleOutsidePress}
          style={{
            position: "absolute",
            top: -1000,
            left: -1000,
            right: -1000,
            bottom: -1000,
            backgroundColor: "rgba(0,0,0,0.25)",
            zIndex: 1,
          }}
        />
      )}

      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: bg,
          borderRadius: focused ? 22 : 16,
          paddingHorizontal: 12,
          paddingVertical: 0,
          borderWidth: 1,
          borderColor,
          transform: [{ scale }],
          zIndex: 2,
        }}
      >

        {/* ICON */}
        <Ionicons
          name="search"
          size={18}
          color={focused ? "#3b82f6" : placeholderColor}
        />

        {/* INPUT AREA */}
        <View
          style={{
            flex: 1,
            marginLeft: 10,
            justifyContent: "center"
          }}
        >

          {/* CENTERED PLACEHOLDER */}
          {value.length === 0 && !focused && (
            <Animated.Text
              style={{
                position: "absolute",
                left: -24,
                right: 0,
                textAlign: "center",

                color: placeholderColor,

                fontSize: 16,            // ⬅️ slightly bigger
                fontWeight: "600",       // ⬅️ semi-bold (clean, not heavy)
                letterSpacing: 0.3,      // ⬅️ premium feel

                opacity: placeholderAnim,

                transform: [
                  {
                    translateY: placeholderAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [4, 0],
                    }),
                  },
                ],
              }}
            >
              {hints[hintIndex]}
            </Animated.Text>
          )}

          {/* INPUT */}
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder=""
            style={{
              color: textColor,
              fontSize: 15,
              textAlign: "center", // 🔥 keeps UX aligned with placeholder
            }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        {/* CLEAR */}
        {value.length > 0 && onClear && (
          <Pressable onPress={onClear}>
            <Ionicons name="close-circle" size={18} color={placeholderColor} />
          </Pressable>
        )}

        {/* CLOSE */}
        {focused && (
          <Pressable
            onPress={() => {
              inputRef.current?.blur();
              Keyboard.dismiss();
            }}
            style={{ marginLeft: 8 }}
          >
            <Ionicons
              name="chevron-down"
              size={18}
              color={placeholderColor}
            />
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}