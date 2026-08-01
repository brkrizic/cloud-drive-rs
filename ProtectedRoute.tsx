import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "hooks/useAuth";
import AuthStack from "navigation/AuthStack";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <ActivityIndicator size="large" />;

  if (!user) return <AuthStack />;

  console.log(user);

  return <>{children}</>;
};
