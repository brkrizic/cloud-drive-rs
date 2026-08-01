import React, { useContext, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "context/AuthContext";
import { useSettings } from "context/SettingsContext";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "constants/colors";
import { useUser } from "context/UserContext";
import { formatSize } from "utils/file";
import AnimatedLoadingIcon from "components/AnimatedLoadingIcon";

export default function ProfileScreen() {
    const { logout, loading } = useContext(AuthContext);
    const { theme } = useSettings();


    const { userData } = useUser();

    const bgMain = theme === "dark" ? colors.background : colors.backgroundLight;
    const bgCard = theme === "dark" ? colors.card : colors.cardLight;
    const textPrimary = theme === "dark" ? colors.textPrimary : colors.textPrimaryLight;
    const textSecondary = theme === "dark" ? colors.textSecondary : colors.textSecondaryLight;
    const textHighlight = theme === "dark" ? colors.textHighlight : colors.textHighlightLight;
    const textError = theme === "dark" ? colors.textError : colors.textErrorLight;

    if (!userData) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bgMain }}>
          <AnimatedLoadingIcon active={true} size={30} source={require('../assets/lottie/Loading.json')} />
        </View>
      );
    }


    const usagePercent = Math.min(
      (userData.storageUsed / userData.storageLimit) * 100,
      100
    );

    const username = userData.username;

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: bgMain }}
        contentContainerStyle={{ padding: 16, paddingTop: 60 }}
      >
        {/* 🔥 PROFILE HEADER */}
        <View
          style={{
            backgroundColor: bgCard,
            borderRadius: 20,
            padding: 24,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=12" }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              marginBottom: 12,
            }}
          />

          <Text style={{ color: textPrimary, fontSize: 22, fontWeight: "700" }}>
            {username}
          </Text>

          <Text style={{ color: textSecondary, fontSize: 13 }}>
            {userData.email}
          </Text>

          {/* ✅ VERIFIED BADGE */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
            <Ionicons
              name={userData.email_verified ? "checkmark-circle" : "alert-circle"}
              size={16}
              color={userData.email_verified ? "#22C55E" : textError}
            />
            <Text
              style={{
                marginLeft: 4,
                fontSize: 12,
                color: userData.email_verified ? "#22C55E" : textError,
              }}
            >
              {userData.email_verified ? "Verified" : "Not verified"}
            </Text>
          </View>

          {/* 🔥 PLAN BADGE */}
          <View
            style={{
              marginTop: 10,
              paddingHorizontal: 14,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor:
                userData.plan === "free" ? "#64748B" : "#22C55E",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 12 }}>
              {userData.plan.toUpperCase()} PLAN
            </Text>
          </View>

          {/* EDIT BUTTON */}
          <TouchableOpacity
            style={{
              marginTop: 14,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: textHighlight + "20",
            }}
          >
            <Ionicons name="pencil" size={16} color={textHighlight} />
            <Text
              style={{
                marginLeft: 6,
                color: textHighlight,
                fontWeight: "600",
              }}
            >
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* 📊 STORAGE CARD */}
        <View
          style={{
            backgroundColor: bgCard,
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <Text style={{ color: textPrimary, fontWeight: "600", marginBottom: 12 }}>
            Storage Usage
          </Text>

          <View
            style={{
              height: 10,
              borderRadius: 6,
              backgroundColor: bgMain,
              overflow: "hidden",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: `${usagePercent}%`,
                height: 10,
                backgroundColor: textHighlight,
              }}
            />
          </View>

          <Text style={{ color: textSecondary, fontSize: 13 }}>
            {userData.storageUsed !== 0 ? formatSize(userData.storageUsed) : 0} /{" "}
            {formatSize(userData.storageLimit)}
          </Text>
        </View>

        {/* 🚪 LOGOUT */}
        <TouchableOpacity
          onPress={logout}
          style={{
            backgroundColor: textError + "20",
            paddingVertical: 14,
            borderRadius: 20,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color={textError} />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="log-out-outline" size={20} color={textError} />
              <Text
                style={{
                  marginLeft: 8,
                  color: textError,
                  fontWeight: "600",
                }}
              >
                Logout
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
}