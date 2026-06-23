import { Tabs } from "expo-router";
import { Image } from "react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2962FF",
        tabBarInactiveTintColor: "#777",
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/home.png")}
              style={{
                width: 26,
                height: 26,
                opacity: focused ? 1 : 0.6,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="worker"
        options={{
          title: "Worker",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/worker.png")}
              style={{
                width: 26,
                height: 26,
                opacity: focused ? 1 : 0.6,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}