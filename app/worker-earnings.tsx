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

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export default function WorkerEarnings() {

  const [earnings, setEarnings] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadEarnings();

  }, []);

  const loadEarnings =
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
            `${API_URL}/api/bookings/worker/${worker._id}`
          );

        const data =
          await response.json();

        const paidBookings =
          data.filter(
            item =>
              item.paymentStatus === "paid"
          );

        setEarnings(paidBookings);

        const totalAmount =
          paidBookings.reduce(
            (sum, item) =>
              sum +
              (item.workerEarning || 0),
            0
          );

        setTotal(totalAmount);

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

      <View style={styles.totalCard}>

        <Text style={styles.totalLabel}>
          Total Earnings
        </Text>

        <Text style={styles.totalAmount}>
          ₹{total}
        </Text>

      </View>

      {earnings.map((item, index) => (

        <View
          key={index}
          style={styles.card}
        >

          <Text style={styles.amount}>
            ₹{item.workerEarning}
          </Text>

          <Text style={styles.text}>
            Payment:
            {" "}
            {item.paymentMethod}
          </Text>

          <Text style={styles.text}>
            Status:
            {" "}
            {item.paymentStatus}
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

  totalCard: {
    backgroundColor: "#00C853",
    margin: 20,
    padding: 25,
    borderRadius: 20
  },

  totalLabel: {
    color: "#fff",
    fontSize: 18
  },

  totalAmount: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold",
    marginTop: 10
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 18,
    borderRadius: 18
  },

  amount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00C853"
  },

  text: {
    marginTop: 5,
    fontSize: 16
  },

  date: {
    marginTop: 10,
    color: "#666"
  }

});