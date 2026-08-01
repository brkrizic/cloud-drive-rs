import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";

type Props = {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
};

function UploadProgressCircle({ progress, size = 48, strokeWidth = 6 }: Props) {
  const { theme } = useSettings();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 100) / 100);

  const bgColor = theme === "dark" ? colors.card : colors.cardLight;
  const accentColor = theme === "dark" ? colors.accent : colors.accentLight;
  const textColor = theme === "dark" ? colors.textPrimary : colors.textPrimaryLight;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          stroke={bgColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <Circle
          stroke={accentColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <Text style={[styles.text, { color: textColor, position: "absolute" }]}>{Math.round(progress)}%</Text>
    </View>
  );
}

export default memo(UploadProgressCircle);

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
