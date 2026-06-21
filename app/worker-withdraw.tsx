import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList
} from "react-native";

import {
  useEffect,
  useState
} from "react";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import API_URL from "@/constants/api";

export default function WorkerWithdraw() {

  const [worker, setWorker] =
    useState<any>(null);

  const [amount, setAmount] =
    useState("");

  const [withdrawals, setWithdrawals] =
    useState<any[]>([]);

  useEffect(() => {

    loadData();

    const interval = setInterval(() => {

      loadData();

    }, 3000);

    return () =>
      clearInterval(interval);

  }, []);

  const loadData = async () => {

    const savedWorker =
      await AsyncStorage.getItem(
        "workerProfile"
      );

    const parsedWorker =
      JSON.parse(savedWorker || "{}");

    if (!parsedWorker?._id) return;

    // GET LATEST WORKER
    const workerResponse =
      await fetch(
        `${API_URL}/api/workers/${parsedWorker._id}`
      );

    const latestWorker =
      await workerResponse.json();

    setWorker(latestWorker);

    await AsyncStorage.setItem(
      "workerProfile",
      JSON.stringify(latestWorker)
    );

    // GET WITHDRAWALS
    const response =
      await fetch(
        `${API_URL}/api/workers/withdrawals/${parsedWorker._id}`
      );
    const data =
      await response.json();

    setWithdrawals(data);
  };
  const requestWithdraw =
    async () => {

      if (!amount) {

        Alert.alert(
          "Enter amount"
        );

        return;

      }

      try {

        const response =
          await fetch(
            `${API_URL}/api/workers/withdraw/${worker._id}`,
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                amount:
                  Number(amount)

              })

            }

          );

        const data =
          await response.json();

        if (response.status !== 200) {

          Alert.alert(
            data.message ||
            "Withdraw failed"
          );

          return;

        }

        Alert.alert(
          "Withdrawal Requested"
        );
        // UPDATE WALLET INSTANTLY

        const updatedWorker = {

          ...worker,

          walletBalance:

            worker.walletBalance -

            Number(amount)

        };

        setWorker(updatedWorker);

        await AsyncStorage.setItem(

          "workerProfile",

          JSON.stringify(updatedWorker)

        );

        // ADD NEW WITHDRAWAL INSTANTLY
        setWithdrawals((prev: any[]) => [

          {

            _id: Date.now().toString(),

            amount: Number(amount),

            status: "pending"

          },

          ...prev

        ]);
        setAmount("");

        loadData();

        setAmount("");

        // REFRESH FROM SERVER
        loadData();

      } catch (err) {

        console.log(err);

      }

    };

  return (

    <View style={styles.container}>

      {/* WALLET */}
      <View style={styles.walletCard}>

        <Text style={styles.walletLabel}>
          Wallet Balance
        </Text>

        <Text style={styles.walletAmount}>
          ₹{worker?.walletBalance || 0}
        </Text>

      </View>

      {/* INPUT */}
      <Text style={styles.label}>
        Withdraw Amount
      </Text>

      <TextInput
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      {/* BUTTON */}
      <TouchableOpacity

        style={styles.withdrawButton}

        onPress={requestWithdraw}

      >

        <Text style={styles.buttonText}>
          Withdraw Money
        </Text>

      </TouchableOpacity>

      {/* HISTORY */}
      <Text style={styles.historyHeading}>
        Recent Withdrawals
      </Text>

      <FlatList

        data={withdrawals}

        keyExtractor={(item: any) =>
          item._id
        }

        renderItem={({ item }: any) => (

          <View style={styles.historyCard}>

            <Text style={styles.historyAmount}>
              ₹{item.amount}
            </Text>

            <Text style={styles.historyStatus}>

              {item.status}

            </Text>

          </View>

        )}

      />

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20
  },

  walletCard: {
    backgroundColor: "#2962FF",
    borderRadius: 24,
    padding: 30,
    marginBottom: 25
  },

  walletLabel: {
    color: "#fff",
    fontSize: 18
  },

  walletAmount: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 10
  },

  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12
  },

  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 18,
    height: 60,
    paddingHorizontal: 18,
    fontSize: 18
  },

  withdrawButton: {
    backgroundColor: "#00C853",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },

  historyHeading: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 35,
    marginBottom: 15
  },

  historyCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  historyAmount: {
    fontSize: 18,
    fontWeight: "bold"
  },

  historyStatus: {
    fontSize: 16,
    color: "#2962FF",
    fontWeight: "bold",
    textTransform: "capitalize"
  }

});