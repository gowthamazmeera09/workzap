import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { useState } from "react";

import { router } from "expo-router";

import API_URL from "@/constants/api";

export default function LoginScreen() {

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const login =
    async () => {

      try {

        if (!email) {

          Alert.alert(
            "Please enter your email."
          );

          return;

        }

        setLoading(true);

        const response =
          await fetch(

            `${API_URL}/api/auth/send-login-otp`,

            {

              method: "POST",

              headers: {

                "Content-Type": "application/json"

              },

              body: JSON.stringify({

                email

              })

            }

          );

        const data =
          await response.json();

        if (!response.ok) {

          Alert.alert(

            "Error",

            data.message

          );

          return;

        }

        Alert.alert(

          "Success",

          "OTP sent to your email."

        );

        router.push({

          pathname: "/verify-otp",

          params: {

            email,

            purpose: "login"

          }

        });

      }

      catch (err) {
        console.log("LOGIN ERROR:", err);

        Alert.alert(
          "Error",
          err.message || JSON.stringify(err)
        );
      }

      finally {

        setLoading(false);

      }

    };
  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        WorkZap Login
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        cursorColor="#2962FF"
        selectionColor="#2962FF"
      />

      <TouchableOpacity

        style={styles.button}

        onPress={login}

        disabled={loading}

      >

        <Text style={styles.buttonText}>

          {

            loading
              ? "Sending OTP..."
              : "Continue"

          }

        </Text>

      </TouchableOpacity>

      <TouchableOpacity

        onPress={() =>
          router.push("/register")
        }

      >

        <Text style={styles.registerText}>

          Create Account

        </Text>

      </TouchableOpacity>

    </View>

  );

}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      justifyContent: "center",
      padding: 25,
      backgroundColor: "#fff"
    },

    title: {
      fontSize: 34,
      fontWeight: "bold",
      marginBottom: 40,
      textAlign: "center"
    },

    input: {
      backgroundColor: "#F5F5F5",
      borderRadius: 14,
      paddingHorizontal: 15,
      height: 55,
      marginBottom: 15,
      fontSize: 16,
      color: "#000"
    },

    button: {
      backgroundColor: "#2962FF",
      height: 55,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10
    },

    buttonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold"
    },

    registerText: {
      marginTop: 25,
      textAlign: "center",
      color: "#2962FF",
      fontWeight: "bold",
      fontSize: 16
    }

  });