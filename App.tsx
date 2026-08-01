import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext } from "context/AuthContext";
import { useAuth } from "hooks/useAuth";
import AuthStack from "navigation/AuthStack";
import { Amplify } from "aws-amplify";
import config from "./aws-exports";
import "global.css";
import { SettingsProvider, useSettings } from "context/SettingsContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetProvider } from "context/BottomSheetContext";
import RootNavigator from "navigation/RootNavigator";
import { UploadProgressProvider } from "context/UploadProgressContext";
import { DownloadProvider } from "context/DownloadContext";
import { FileQueryProvider } from "context/FileQueryContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Text, View } from "react-native";
import AuthLoadingScreen from "screens/AuthLoadingScreen";
import { UserContext, UserProvider } from "context/UserContext";
import { useEffect } from "react";
import { setGlobalLogout } from "handlers/globalLogout";
import { initNetworkListener } from "utils/networkHelper";
import LoginScreen from "screens/LoginScreen";
import { AuthError } from "aws-amplify/auth";
import { AppStatusBar } from "components/AppStatusBar";

Amplify.configure(config);

export const queryClient = new QueryClient();

export default function App() {
  const auth = useAuth();

  useEffect(() => {
    console.log(auth.authState);
  }, [auth]);

  useEffect(() => {
    initNetworkListener();
  }, []);

  useEffect(() => {
    setGlobalLogout(auth.logout);
  }, [auth]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SettingsProvider>
          <AppStatusBar/>
          <UploadProgressProvider>
            <FileQueryProvider>
              <QueryClientProvider client={queryClient}>
                <DownloadProvider>
                  <BottomSheetProvider>
                    <AuthContext.Provider value={auth}>
                      <UserProvider>
                        <NavigationContainer>
                          
                          {auth.authState === "initializing" && (
                            <AuthLoadingScreen authState={auth.authState} />
                          )}

                          {auth.authState === "unauthenticated" && (
                            <AuthStack authError={auth.error}/>
                          )}

                          {auth.authState === "authenticated" && (
                            <RootNavigator />
                          )}

                        </NavigationContainer>
                      </UserProvider>
                    </AuthContext.Provider>
                  </BottomSheetProvider>
                </DownloadProvider>
              </QueryClientProvider>
            </FileQueryProvider>
          </UploadProgressProvider>
        </SettingsProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}