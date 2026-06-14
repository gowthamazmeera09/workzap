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

export default function LoginScreen() {

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const login =
    async () => {

      try {

        setLoading(true);

        const response =
          await fetch(

            "http://192.168.2.225:5000/api/auth/login",

            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

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
        // CLEAR OLD DATA
        await AsyncStorage.clear();

        // SAVE TOKEN
        await AsyncStorage.setItem(

          "token",

          data.token

        );

        // SAVE USER
        await AsyncStorage.setItem(

          "user",

          JSON.stringify(
            data.user
          )

        );
        // IF USER IS WORKER
        if (data.user.isWorker) {

          const response =
            await fetch(

              `http://192.168.2.225:5000/api/workers/user/${data.user._id}`

            );

          const worker =
            await response.json();

          await AsyncStorage.setItem(

            "workerProfile",

            JSON.stringify(worker)

          );

        }

        router.replace(
          "/(tabs)"
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
        WorkZap Login
      </Text>

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

        onPress={login}

      >

        <Text style={styles.buttonText}>

          {
            loading
              ? "Loading..."
              : "Login"
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
      fontSize: 16
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