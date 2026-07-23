import React, { useEffect } from "react";
import {
  View,
  ActivityIndicator,
  Text
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  router
} from "expo-router";

export default function StartScreen() {

  useEffect(() => {

    checkLogin();

  }, []);

  const checkLogin = async () => {

    try {

      const token =
        await AsyncStorage.getItem("token");

      const user =
        await AsyncStorage.getItem("user");

      console.log("TOKEN:", token);
      console.log("USER:", user);

      if (!token || !user) {

        console.log("➡ LOGIN");

        router.replace("/login");

        return;

      }

      console.log("➡ HOME");

      router.replace("/(tabs)");

    } catch (error) {

      console.log(error);

      router.replace("/login");

    }

  };

  return (

    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
      }}
    >

      <ActivityIndicator
        size="large"
        color="#2962FF"
      />

      <Text
        style={{
          marginTop: 20,
          fontSize: 16
        }}
      >
        Checking Login...
      </Text>

    </View>

  );

}