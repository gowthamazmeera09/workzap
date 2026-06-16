import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from "react-native";

import {
  useEffect,
  useState
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WorkerHistory() {

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadHistory();

  }, []);

  const loadHistory =
    async () => {

      try {

        const workerData =
          await AsyncStorage.getItem(
            "workerProfile"
          );

        const worker =
          JSON.parse(workerData);

        const response =
          await fetch(
            `http://192.168.2.225:5000/api/bookings/worker-history/${worker._id}`
          );

        const data =
          await response.json();

        setHistory(data);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

    };

  if (loading) {

    return (
      <ActivityIndicator
        size="large"
        style={{ marginTop: 50 }}
      />
    );

  }

  return (

    <ScrollView
      style={styles.container}
    >

      {history.map((item, index) => (

        <View
          key={index}
          style={styles.card}
        >

          <Text style={styles.work}>
            {item.serviceType}
          </Text>

          <Text style={styles.text}>
            Status:
            {" "}
            {item.status}
          </Text>

          <Text style={styles.text}>
            Quote:
            ₹{item.quoteAmount}
          </Text>

          <Text style={styles.text}>
            Payment:
            {" "}
            {item.paymentMethod}
          </Text>

          <Text style={styles.date}>
            {new Date(
              item.createdAt
            ).toLocaleDateString()}
          </Text>

        </View>

      ))}

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F5F7"
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 18,
    borderRadius: 18
  },

  work: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },

  text: {
    fontSize: 16,
    marginTop: 5
  },

  date: {
    marginTop: 10,
    color: "#666"
  }

});