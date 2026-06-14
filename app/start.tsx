import {
  View,
  ActivityIndicator
} from "react-native";

import {
  useEffect
} from "react";

import AsyncStorage from
"@react-native-async-storage/async-storage";

import {
  router
} from "expo-router";

export default function StartScreen() {

  useEffect(() => {

    checkLogin();

  }, []);

  const checkLogin =
    async () => {

      try {

        const token =
          await AsyncStorage.getItem(
            "token"
          );

        const savedUser =
          await AsyncStorage.getItem(
            "user"
          );

        // NOT LOGGED IN
        if (
          !token ||
          !savedUser
        ) {

          router.replace(
            "/login"
          );

          return;

        }

        // OPEN APP DIRECTLY
        router.replace(
          "/(tabs)"
        );

      } catch (err) {

        console.log(err);

        router.replace(
          "/login"
        );

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

    </View>

  );

}