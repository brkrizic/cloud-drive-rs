import React, { useCallback, useContext, useEffect } from "react";
import { View, Text, ScrollView, Switch, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { fabVisible } from "store/fabStore";
import { AuthContext } from "context/AuthContext";
import { deleteUserAccount } from "services/fileService";
import { useUser } from "context/UserContext";


export default function SettingsScreen() {
  const { theme, toggleTheme, notificationsEnabled, toggleNotifications } = useSettings();
  const insets = useSafeAreaInsets();
  const { logout, loading } = useContext(AuthContext)

  const { userData } = useUser();

  const handleDeleteAccount = async () => {
    try {
      const result = await deleteUserAccount();

      if (result?.success) {
        await logout(); // clears Cognito/session state

        // optional safety navigation reset
        // navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }
    } catch (err) {
      console.log(err);
    }
  };


useFocusEffect(
  useCallback(() => {
    fabVisible.value = 0;

    return () => {
      fabVisible.value = 1;
    };
  }, [])
);
  // Determine colors based on theme
  const bg = theme === "dark" ? colors.background : colors.backgroundLight;
  const card = theme === "dark" ? colors.card : colors.cardLight;
  const textPrimary = theme === "dark" ? colors.textPrimary : colors.textPrimaryLight;
  const textSecondary = theme === "dark" ? colors.textSecondary : colors.textSecondaryLight;
  const highlight = theme === "dark" ? colors.textHighlight : colors.textHighlightLight;
  const error = theme === "dark" ? colors.textError : colors.textErrorLight;
  const accent = theme === "dark" ? colors.accent : colors.accentLight;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg, padding: 16 }} contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
      
      {/* Account Section */}
      <Text style={{ color: textSecondary, marginBottom: 4, fontSize: 12 }}>Account</Text>
      <View style={{ backgroundColor: card, borderRadius: 12, marginBottom: 16 }}>
        <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme === 'dark' ? colors.cardHover : colors.cardHoverLight }}>
          <View>
            <Text style={{ color: textPrimary, fontWeight: '600' }}>Username</Text>
            <Text style={{ color: textSecondary, fontSize: 12 }}>{userData?.username}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <View>
            <Text style={{ color: textPrimary, fontWeight: '600' }}>Email</Text>
            <Text style={{ color: textSecondary, fontSize: 12 }}>{userData?.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <Text style={{ color: textSecondary, marginBottom: 4, fontSize: 12 }}>Preferences</Text>
      <View style={{ backgroundColor: card, borderRadius: 12, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme === 'dark' ? colors.cardHover : colors.cardHoverLight }}>
          <Text style={{ color: textPrimary, fontWeight: '600' }}>Dark Mode</Text>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.cardHoverLight, true: highlight }}
            thumbColor={theme === "dark" ? "#fff" : "#fff"}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <Text style={{ color: textPrimary, fontWeight: '600' }}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: colors.cardHoverLight, true: accent }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* App Section */}
      <Text style={{ color: textSecondary, marginBottom: 4, fontSize: 12 }}>App</Text>
      <View style={{ backgroundColor: card, borderRadius: 12, marginBottom: 16 }}>
        <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme === 'dark' ? colors.cardHover : colors.cardHoverLight }}>
          <Text style={{ color: textPrimary, fontWeight: '600' }}>About</Text>
          <Ionicons name="chevron-forward" size={20} color={textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme === 'dark' ? colors.cardHover : colors.cardHoverLight }}>
          <Text style={{ color: textPrimary, fontWeight: '600' }}>Terms & Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color={textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <Text style={{ color: textPrimary, fontWeight: '600' }}>Version</Text>
          <Text style={{ color: textSecondary, fontSize: 12 }}>1.0.0</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <Text style={{ color: textSecondary, marginBottom: 4, fontSize: 12 }}>Danger Zone</Text>
      <View style={{ backgroundColor: card, borderRadius: 12, overflow: 'hidden' }}>
        <TouchableOpacity style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme === 'dark' ? colors.cardHover : colors.cardHoverLight }} onPress={logout}>
          <Text style={{ color: colors.textError, fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 16 }} onPress={handleDeleteAccount}>
          <Text style={{ color: colors.textError, fontWeight: '600' }}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
