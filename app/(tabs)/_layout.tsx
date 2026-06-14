import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs>

  <Tabs.Screen
    name="index"
    options={{
      title: "Home",
      headerShown: false
    }}
  />

  <Tabs.Screen
    name="worker"
    options={{
      title: "Worker",
      headerShown: false
    }}
  />

</Tabs>
  );
}