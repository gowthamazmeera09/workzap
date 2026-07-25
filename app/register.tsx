import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";

import { useState } from "react";

import { router } from "expo-router";

import API_URL from "@/constants/api";

export default function RegisterScreen() {

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);

  const register = async () => {

    try {

      if (!name || !email || !phone) {

        Alert.alert(
          "Validation",
          "Please fill all fields."
        );

        return;

      }

      setLoading(true);

      const response = await fetch(

        `${API_URL}/api/auth/send-register-otp`,

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json"

          },

          body: JSON.stringify({

            name,

            email,

            phone

          })

        }

      );

      const data = await response.json();

      if (!response.ok) {

        Alert.alert(

          "Error",

          data.message

        );

        return;

      }

      Alert.alert(

        "Success",

        "OTP has been sent to your email."

      );

      router.push({

        pathname: "/verify-otp",

        params: {

          email,

          purpose: "register"

        }

      });

    }

    catch (err) {

      console.log(err);

      Alert.alert(

        "Error",

        "Something went wrong."

      );

    }

    finally {

      setLoading(false);

    }

  };
    return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Create Account
      </Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
        style={styles.input}
        cursorColor="#2962FF"
        selectionColor="#2962FF"
      />

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

      <TextInput
        placeholder="Phone"
        placeholderTextColor="#888"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
        cursorColor="#2962FF"
        selectionColor="#2962FF"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={register}
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
          router.replace("/login")
        }
      >

        <Text style={styles.loginText}>
          Already have an account? Login
        </Text>

      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

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
    fontSize: 16
  },

  button: {
    backgroundColor: "#2962FF",
    height: 55,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center"
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },

  loginText: {
    marginTop: 25,
    textAlign: "center",
    color: "#2962FF",
    fontWeight: "bold",
    fontSize: 16
  }

});