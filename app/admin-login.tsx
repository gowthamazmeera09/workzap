import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet
} from "react-native";

import {
  useState
} from "react";

import {
  router
} from "expo-router";

export default function AdminLogin() {

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

        // YOUR ADMIN LOGIN
        if (

          phone === "6303497101" &&
          password === "admin123"

        ) {

          router.replace(
            "/admin-dashboard"
          );

        } else {

          Alert.alert(
            "Access Denied"
          );

        }

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

    };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Admin Access
      </Text>

      <Text style={styles.subtitle}>
        Private Dashboard
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

        secureTextEntry

        value={password}

        onChangeText={setPassword}

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
    textAlign: "center",
    color: "#111"
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginTop: 8,
    marginBottom: 40
  },

  input: {
    backgroundColor: "#F5F5F5",
    height: 58,
    borderRadius: 16,
    paddingHorizontal: 18,
    marginBottom: 18,
    fontSize: 16
  },

  button: {
    backgroundColor: "#2962FF",
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  }

});