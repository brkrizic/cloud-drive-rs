import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import AuthErrorBubble from "components/AuthErrorBubble";

const Stack = createNativeStackNavigator();

type AuthStackScreensProps = {
  authError: string | null;
}

export default function AuthStack({ authError }: AuthStackScreensProps) {
  const [visibleError, setVisibleError] = useState<string | null>(null);


  useEffect(() => {
    if (authError) {
      setVisibleError(authError);
    }
  }, [authError]);


  return (
    <>
      <AuthErrorBubble
        message={visibleError}
        onHide={() => setVisibleError(null)}
      />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </>
  );
}
