import { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthContext } from "context/AuthContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

export default function LoginScreen({ navigation }: any) {
  const auth = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  // Backgroud View Animation
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, {
        duration: 6000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  const glowStyle1 = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: float.value * 20,
      },
      {
        translateX: float.value * 10,
      },
    ],
  }));

  const glowStyle2 = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: float.value * -15,
      },
      {
        translateX: float.value * -10,
      },
    ],
  }));

  // Card Animation

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 500 });
  }, []);

  // Input Animation
  const usernameScale = useSharedValue(1);
  const passwordScale = useSharedValue(1);

  const usernameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: usernameScale.value }],
  }));

  const passwordStyle = useAnimatedStyle(() => ({
    transform: [{ scale: passwordScale.value }],
  }));

  const onFocusUsername = () => {
    usernameScale.value = withTiming(1.02);
  };

  const onBlurUsername = () => {
    usernameScale.value = withTiming(1);
  };


  const handleLogin = async () => {
    try {
      await auth.login({ username, password });
    } catch {}
  };

  return (
    <View className="flex-1 bg-[#0B1220]">
      
      {/* subtle background glow */}
      <Animated.View
        style={glowStyle1} 
        className="absolute w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-3xl -top-40 -left-40" 
      />
      <Animated.View 
        style={glowStyle2}
        className="absolute w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl -bottom-40 -right-40" 
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center px-6"
      >

        {/* Brand */}
        <View className="mb-10">
          <Text className="text-white text-4xl font-bold tracking-tight">
            Stashr
          </Text>
          <Text className="text-slate-400 mt-2">
            Secure your uploads, access anywhere
          </Text>
        </View>

        {/* Card */}
        <Animated.View 
          style={cardStyle}
          className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 shadow-lg"
        >

          {/* Username */}
          <Text className="text-slate-400 text-xs mb-2 ml-1">
            Username
          </Text>
          <Animated.View style={usernameStyle}>
            <View className="bg-[#0B1220] rounded-2xl px-4 py-3 mb-4 border border-slate-800">
              <TextInput
                onFocus={onFocusUsername}
                onBlur={onBlurUsername}
                placeholder="Enter username"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                className="text-white"
              />
            </View>
          </Animated.View>

          {/* Password */}
          <Text className="text-slate-400 text-xs mb-2 ml-1">
            Password
          </Text>
          <Animated.View style={passwordStyle}>
            <View className="bg-[#0B1220] rounded-2xl px-4 py-3 mb-2 border border-slate-800">
              <TextInput
                placeholder="Enter password"
                placeholderTextColor="#64748b"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="text-white"
              />
            </View>
          </Animated.View>

          {/* Error
          {auth.error && (
            <Text className="text-red-400 mt-3 text-sm">
              {auth.error}
            </Text>
          )} */}

          {/* Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={auth.loading}
            className="mt-6 w-full rounded-2xl py-4 items-center justify-center bg-emerald-500"
            activeOpacity={0.8}
          >
            {auth.loading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text className="text-black font-semibold text-base">
                Sign in
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Links */}
        <View className="mt-8 flex-row justify-between px-2">
          <Text
            onPress={() => navigation.navigate("Register")}
            className="text-slate-400"
          >
            Create account
          </Text>

          <Text
            onPress={() => navigation.navigate("ForgotPassword")}
            className="text-slate-400"
          >
            Forgot password?
          </Text>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}