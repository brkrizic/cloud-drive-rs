import { StatusBar } from "react-native";
import { useSettings } from "context/SettingsContext";

export function AppStatusBar() {
  const { theme } = useSettings();

  const isDark = theme === "dark";

  return (
    <StatusBar
      barStyle={isDark ? "light-content" : "dark-content"}
      backgroundColor={isDark ? "#0B1220" : "#F8FAFC"}
    />
  );
}