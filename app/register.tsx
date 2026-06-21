import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";

import {
  useState
} from "react";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import {
  router
} from "expo-router";

import API_URL from "@/constants/api";

export default function RegisterScreen() {

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const register =
    async () => {

      try {

        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/auth/register`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                name,
                phone,
                password
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          Alert.alert(
            data.message
          );

          return;

        }



        // OPEN APP
        Alert.alert(
          "Registration Successful"
        );

        router.replace(
          "/login"
        );

      } catch (err) {

        console.log(err);

      } finally {

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

        value={name}

        onChangeText={setName}

        style={styles.input}

      />

      <TextInput

        placeholder="Phone"

        value={phone}

        onChangeText={setPhone}

        keyboardType="phone-pad"

        style={styles.input}

      />

      <TextInput

        placeholder="Password"

        value={password}

        onChangeText={setPassword}

        secureTextEntry

        style={styles.input}

      />

      <TouchableOpacity

        style={styles.button}

        onPress={register}

      >

        <Text style={styles.buttonText}>

          {

            loading
              ? "Loading..."
              : "Register"

          }

        </Text>

      </TouchableOpacity>

      <TouchableOpacity

        onPress={() =>
          router.replace("/login")
        }

      >

        <Text style={styles.loginText}>
          Already have account?
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