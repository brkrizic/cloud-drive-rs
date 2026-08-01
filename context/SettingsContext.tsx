import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeType = "light" | "dark";

type SettingsContextType = {
  theme: ThemeType;
  notificationsEnabled: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  toggleNotifications: () => void;
  setNotifications: (enabled: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const THEME_KEY = "theme";

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>("dark");
  const [notificationsEnabled, setNotificationsState] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // ✅ LOAD theme on app start
  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
      }
      setLoading(false);
    };

    loadTheme();
  }, []);

  // ✅ SAVE theme whenever it changes
  const setTheme = async (value: ThemeType) => {
    setThemeState(value);
    await AsyncStorage.setItem(THEME_KEY, value);
  };

  const toggleTheme = async () => {
    const next = theme === "dark" ? "light" : "dark";
    await setTheme(next);
  };

  const toggleNotifications = () =>
    setNotificationsState((prev) => !prev);

  const setNotifications = (value: boolean) =>
    setNotificationsState(value);

  if (loading) return null; // or splash screen

  return (
    <SettingsContext.Provider
      value={{
        theme,
        notificationsEnabled,
        toggleTheme,
        setTheme,
        toggleNotifications,
        setNotifications,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};