// navigation/RootNavigator.tsx
import React, { useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AppTabs from "./AppTabs";
import ProfileScreen from "../screens/ProfileScreen";
import { initDb } from "database/initDb";

const Drawer = createDrawerNavigator();

export default function RootNavigator() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
        const init = async () => {
          await initDb();
          setDbReady(true);
        }
        init();
  }, []);

  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={() => <ProfileScreen />} // Profile renders inside drawer
    >
      <Drawer.Screen name="Tabs">
        {(props) => <AppTabs {...props} dbReady={dbReady} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
