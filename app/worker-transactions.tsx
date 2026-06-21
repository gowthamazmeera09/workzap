import {
    View,
    Text,
    StyleSheet,
    FlatList
} from "react-native";

import {
    useEffect,
    useState
} from "react";

import AsyncStorage from
    "@react-native-async-storage/async-storage";

import API_URL from "@/constants/api";

export default function WorkerTransactions() {

    const [transactions, setTransactions] =
        useState([]);

    useEffect(() => {

        loadTransactions();

    }, []);

    const loadTransactions =
        async () => {

            const savedWorker =
                await AsyncStorage.getItem(
                    "workerProfile"
                );

            const worker =
                JSON.parse(savedWorker || "{}");

            const response =
                await fetch(
                    `${API_URL}/api/bookings/worker-history/${worker._id}`
                );

            const data =
                await response.json();

            setTransactions(data);

        };

    return (

        <View style={styles.container}>

            <Text style={styles.heading}>
                Transactions
            </Text>

            <FlatList

                data={transactions}

                keyExtractor={(item: any, index) =>

                    item?._id?.toString() ||

                    index.toString()

                } renderItem={({ item }: any) => (

                    <View style={styles.card}>

                        {/* SERVICE */}
                        <Text style={styles.title}>
                            {item.serviceType}
                        </Text>

                        {/* ONLINE PAYMENT */}
                        {item.paymentMethod === "online" ? (

                            <>

                                <Text style={styles.totalText}>

                                    Total:
                                    {" "}
                                    ₹{item.quoteAmount}

                                </Text>

                                <Text style={styles.creditText}>

                                    Online Credit:
                                    {" "}
                                    +₹{item.workerEarning}

                                </Text>

                                <Text style={styles.smallText}>

                                    Platform Fee:
                                    {" "}
                                    ₹{item.commission}

                                </Text>

                            </>

                        ) : (

                            <>

                                {/* CASH PAYMENT */}

                                <Text style={styles.totalText}>

                                    Total:
                                    {" "}
                                    ₹{item.quoteAmount}

                                </Text>

                                <Text style={styles.cashEarnText}>

                                    Cash Received:
                                    {" "}
                                    ₹{item.quoteAmount}

                                </Text>

                                <Text style={styles.debitText}>

                                    Platform Fee Due:
                                    {" "}
                                    ₹{item.commission}

                                </Text>

                            </>

                        )}

                        {/* DATE */}
                        <Text style={styles.date}>

                            {new Date(
                                item.createdAt
                            ).toLocaleDateString()}

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

    heading: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20
    },

    card: {
        backgroundColor: "#F5F5F5",
        padding: 18,
        borderRadius: 18,
        marginBottom: 14
    },

    amount: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#00C853"
    },

    title: {
        marginTop: 8,
        fontSize: 17
    },

    date: {
        marginTop: 6,
        color: "#777"
    },
    rowText: {
        marginTop: 10,
        fontSize: 15,
        color: "#444"
    },

    feeText: {
        marginTop: 6,
        fontSize: 15,
        color: "#FF3B30",
        fontWeight: "600"
    },

    earnText: {
        marginTop: 6,
        fontSize: 18,
        color: "#00C853",
        fontWeight: "bold"
    },
    creditText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#00C853",
        marginTop: 10
    },

    debitText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FF3B30",
        marginTop: 10
    },

    smallText: {
        marginTop: 5,
        color: "#666"
    },
    totalText: {
        marginTop: 10,
        fontSize: 17,
        fontWeight: "600",
        color: "#333"
    },

    cashEarnText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#00C853",
        marginTop: 10
    },

    finalText: {
        marginTop: 6,
        color: "#FF3B30",
        fontWeight: "600",
        fontSize: 15
    },


});