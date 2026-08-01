import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ProfileScreen from "../screens/ProfileScreen";

const Drawer = createDrawerNavigator();

export default function ProfileDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,   // hide default drawer header
        drawerType: "slide",  // slide from left
        swipeEnabled: true,   // optional: allow swipe to open
      }}
    >
      <Drawer.Screen name="ProfileMain" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}
