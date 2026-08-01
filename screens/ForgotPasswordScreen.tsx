import { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthContext } from "context/AuthContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";

export default function ForgotPasswordScreen({ navigation }: any) {
  const auth = useContext(AuthContext);

  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // ----------------------------
  // BACKGROUND (same system)
  // ----------------------------
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
      { translateY: float.value * 20 },
      { translateX: float.value * 10 },
    ],
  }));

  const glowStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: float.value * -15 },
      { translateX: float.value * -10 },
    ],
  }));

  // ----------------------------
  // CARD ANIMATION
  // ----------------------------
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 500 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // ----------------------------
  // STEP TRANSITION
  // ----------------------------
  const stepOpacity = useSharedValue(1);

  const stepStyle = useAnimatedStyle(() => ({
    opacity: stepOpacity.value,
  }));

  const handleSendCode = async () => {
    try {
      await auth.startReset({ username });
      setStep(2);
    } catch {}
  };

  const handleConfirm = async () => {
    try {
      await auth.confirmReset({
        username,
        confirmationCode: code,
        newPassword,
      });

      navigation.goBack();
    } catch {}
  };

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <View className="flex-1 bg-[#0B1220]">

      {/* BACKGROUND */}
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

        {/* HEADER */}
        <View className="mb-10">
          <Text className="text-white text-4xl font-bold tracking-tight">
            Reset Password
          </Text>
          <Text className="text-slate-400 mt-2">
            {step === 1
              ? "Enter your email or username"
              : "Enter code and new password"}
          </Text>
        </View>

        {/* CARD */}
        <Animated.View
          style={[cardStyle, stepStyle]}
          className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 shadow-lg"
        >

          {step === 1 ? (
            <>
              {/* USERNAME */}
              <Text className="text-slate-400 text-xs mb-2 ml-1">
                Email / Username
              </Text>
              <View className="bg-[#0B1220] rounded-2xl px-4 py-3 mb-4 border border-slate-800">
                <TextInput
                  placeholder="Enter email or username"
                  placeholderTextColor="#64748b"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                  className="text-white"
                />
              </View>

              {/* {auth.error && (
                <Text className="text-red-400 mt-3 text-sm">
                  {auth.error}
                </Text>
              )} */}

              <TouchableOpacity
                onPress={handleSendCode}
                disabled={auth.loading}
                className="mt-6 w-full rounded-2xl py-4 items-center justify-center bg-emerald-500"
              >
                {auth.loading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text className="text-black font-semibold text-base">
                    Send Code
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* CODE */}
              <Text className="text-slate-400 text-xs mb-2 ml-1">
                Verification Code
              </Text>
              <View className="bg-[#0B1220] rounded-2xl px-4 py-3 mb-4 border border-slate-800">
                <TextInput
                  placeholder="Enter code"
                  placeholderTextColor="#64748b"
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={setCode}
                  className="text-white"
                />
              </View>

              {/* NEW PASSWORD */}
              <Text className="text-slate-400 text-xs mb-2 ml-1">
                New Password
              </Text>
              <View className="bg-[#0B1220] rounded-2xl px-4 py-3 mb-2 border border-slate-800">
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  className="text-white"
                />
              </View>

              {/* {auth.error && (
                <Text className="text-red-400 mt-3 text-sm">
                  {auth.error}
                </Text>
              )} */}

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={auth.loading}
                className="mt-6 w-full rounded-2xl py-4 items-center justify-center bg-emerald-500"
              >
                {auth.loading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text className="text-black font-semibold text-base">
                    Reset Password
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

        </Animated.View>

        {/* BACK TO LOGIN */}
        <View className="mt-8 flex-row justify-center">
          <Text
            onPress={() => navigation.goBack()}
            className="text-slate-400"
          >
            Back to login
          </Text>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}