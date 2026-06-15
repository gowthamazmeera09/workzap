import React, {
  useEffect,
  useState
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export default function EditWorkerProfile() {

  const [worker, setWorker] =
    useState<any>(null);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [upiId, setUpiId] =
    useState("");

  const [bankName, setBankName] =
    useState("");

  const [accountNumber,
    setAccountNumber] =
    useState("");

  const [ifsc, setIfsc] =
    useState("");

  useEffect(() => {

    loadWorker();

  }, []);

  const loadWorker =
    async () => {

      const savedWorker =
        await AsyncStorage.getItem(
          "workerProfile"
        );

      if (!savedWorker) return;

      const data =
        JSON.parse(savedWorker);

      setWorker(data);

      setName(data.name || "");

      setEmail(data.email || "");

      setUpiId(data.upiId || "");

      setBankName(
        data.bankName || ""
      );

      setAccountNumber(
        data.accountNumber || ""
      );

      setIfsc(data.ifsc || "");

    };

  const saveProfile =
    async () => {

      try {

        const response =
          await fetch(

            `${API_URL}/api/workers/update-profile/${worker._id}`,

            {

              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                name,

                email,

                upiId,

                bankName,

                accountNumber,

                ifsc

              })

            }

          );

        const updatedWorker =
          await response.json();

        await AsyncStorage.setItem(

          "workerProfile",

          JSON.stringify(
            updatedWorker
          )

        );

        Alert.alert(
          "Success",
          "Profile Updated"
        );

        router.back();

      } catch (err) {

        console.log(err);

        Alert.alert(
          "Error",
          "Update failed"
        );

      }

    };

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.title}>
        Edit Profile
      </Text>

      <Image
        source={{
          uri:
            worker?.image ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }}
        style={styles.image}
      />

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="UPI ID"
        value={upiId}
        onChangeText={setUpiId}
      />

      <TextInput
        style={styles.input}
        placeholder="Bank Name"
        value={bankName}
        onChangeText={setBankName}
      />

      <TextInput
        style={styles.input}
        placeholder="Account Number"
        value={accountNumber}
        onChangeText={
          setAccountNumber
        }
      />

      <TextInput
        style={styles.input}
        placeholder="IFSC Code"
        value={ifsc}
        onChangeText={setIfsc}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={saveProfile}
      >

        <Text style={styles.buttonText}>
          Save Changes
        </Text>

      </TouchableOpacity>

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    padding: 20
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 25,
    textAlign: "center"
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 25
  },

  input: {
    backgroundColor: "#fff",
    height: 58,
    borderRadius: 16,
    paddingHorizontal: 18,
    marginBottom: 15,
    fontSize: 16,
    elevation: 2
  },

  button: {
    backgroundColor: "#2962FF",
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  }

});