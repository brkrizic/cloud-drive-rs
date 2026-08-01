import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "app_theme";

export const saveTheme = async (theme: "dark" | "light") => {
  await AsyncStorage.setItem(THEME_KEY, theme);
};

export const getTheme = async (): Promise<"dark" | "light"> => {
  const value = await AsyncStorage.getItem(THEME_KEY);
  return value === "dark" ? "dark" : "light";
};