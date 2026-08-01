import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type FileItemComProps = {
  onPreview?: () => void;
  onDownload?: () => void;
  onInfo?: () => void;
  onDelete?: () => void;
  children: (toggleActions: () => void) => React.ReactNode;
  autoCloseMs?: number; // optional auto-close time
  style?: object;
  direction?: "horizontal" | "vertical";
};

function FileItemCom({
  children,
  onPreview,
  onDownload,
  onInfo,
  onDelete,
  autoCloseMs = 3000, // default 3 seconds
  style,
  direction = "horizontal",
}: FileItemComProps) {
  const [showActions, setShowActions] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggleActions = () => {
    Animated.timing(anim, {
      toValue: showActions ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
    setShowActions(!showActions);
  };

  // Auto-close effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showActions) {
      timer = setTimeout(() => {
        toggleActions();
      }, autoCloseMs);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showActions, autoCloseMs]);

  // staggered translate for each icon
  const createTranslate = (index: number) => {
    if (direction === "horizontal") {
      return anim.interpolate({
        inputRange: [0, 1],
        outputRange: [50 * (index + 1), 0], // left → right
      });
    } else {
      return anim.interpolate({
        inputRange: [0, 1],
        outputRange: [50 * (index + 1), 0], // bottom → top
      });
    }
  };

  const translateStyle = (index: number) =>
    direction === "horizontal"
      ? { transform: [{ translateX: createTranslate(index) }] }
      : { transform: [{ translateY: createTranslate(index) }] };

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const renderedChildren = useMemo(() => children(toggleActions), [children, toggleActions]);

  return (
    <View style={[{ position: "relative" }, style ]}>
    {/* File row */}
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.fileRow}
      onPress={onPreview}
    >
      {renderedChildren}
    </TouchableOpacity>

      {/* Overlay */}
      {showActions && (
        <Animated.View style={[styles.overlay, { opacity: anim }]} pointerEvents="auto">
          <TouchableOpacity style={{ flex: 1 }} onPress={toggleActions} />
        </Animated.View>
      )}

      {/* Action buttons */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={styles.actionsWrapper} pointerEvents="box-none">
          {onPreview && (
            <Animated.View
              style={[styles.actionCircle, translateStyle(0), { opacity }]}
            >
              <TouchableOpacity style={styles.iconButton} onPress={onPreview}>
                <Ionicons name="eye-outline" size={22} color="#22C55E" />
              </TouchableOpacity>
            </Animated.View>
          )}
          {onDownload && (
            <Animated.View style={[styles.actionCircle, { transform: [{ translateX: createTranslate(1) }], opacity }]}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onDownload}
                activeOpacity={0.7}
              >
                <Ionicons name="download-outline" size={22} color="#0EA5E9" />
              </TouchableOpacity>
            </Animated.View>
          )}
          {onInfo && (
            <Animated.View
              style={[styles.actionCircle, translateStyle(3), { opacity }]}
            >
              <TouchableOpacity style={styles.iconButton} onPress={onInfo}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color="#FBBF24"
                />
              </TouchableOpacity>
            </Animated.View>
          )}
          {onDelete && (
            <Animated.View
              style={[styles.actionCircle, translateStyle(4), { opacity }]}
            >
              <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color="#EF4444" // red for delete
                />
              </TouchableOpacity>
            </Animated.View>
          )}

        </View>
      </View>
    </View>
  );
}

export default React.memo(FileItemCom)

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    position: "relative",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionsWrapper: {
    position: "absolute",
    right: 10,
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 50
  },
  actionCircle: {
    marginLeft: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgb(51 65 85);",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
