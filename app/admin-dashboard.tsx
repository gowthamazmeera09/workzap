import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image
} from "react-native";

import {
    useEffect,
    useState
} from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export default function AdminDashboard() {

    const [withdrawals, setWithdrawals] =
        useState<any[]>([]);

    const [stats, setStats] =
        useState<any>(null);

    useEffect(() => {

        fetchWithdrawals();

        fetchStats();

        const interval = setInterval(() => {

            fetchWithdrawals();

            fetchStats();

        }, 5000);

        return () =>
            clearInterval(interval);

    }, []);

    const fetchWithdrawals =
        async () => {

            try {

                const response =
                    await fetch(

                        `${API_URL}/api/admin/withdrawals`

                    );

                const data =
                    await response.json();

                setWithdrawals(data);

            } catch (err) {

                console.log(err);

            }

        };

    const fetchStats =
        async () => {

            try {

                const response =
                    await fetch(

                        `${API_URL}/api/admin/stats`

                    );

                const data =
                    await response.json();

                setStats(data);

            } catch (err) {

                console.log(err);

            }

        };

    const approveWithdrawal =
        async (id: string) => {

            try {

                await fetch(

                    `${API_URL}/api/admin/approve/${id}`,

                    {

                        method: "POST"

                    }

                );

                Alert.alert(
                    "Withdrawal Approved"
                );

                fetchWithdrawals();

            } catch (err) {

                console.log(err);

            }

        };

    const rejectWithdrawal =
        async (id: string) => {

            try {

                await fetch(

                    `${API_URL}/api/admin/reject/${id}`,

                    {

                        method: "POST"

                    }

                );

                Alert.alert(
                    "Withdrawal Rejected"
                );

                fetchWithdrawals();

            } catch (err) {

                console.log(err);

            }

        };

    return (

        <View style={styles.container}>

            <Text style={styles.heading}>
                Admin Dashboard
            </Text>
            <View style={styles.statsRow}>

                <View style={styles.statsCard}>

                    <Text style={styles.statsNumber}>
                        ₹{stats?.totalCommission || 0}
                    </Text>

                    <Text style={styles.statsLabel}>
                        Commission
                    </Text>

                </View>

                <View style={styles.statsCard}>

                    <Text style={styles.statsNumber}>
                        {stats?.completedJobs || 0}
                    </Text>

                    <Text style={styles.statsLabel}>
                        Jobs
                    </Text>

                </View>

            </View>

            <View style={styles.statsRow}>

                <View style={styles.statsCard}>

                    <Text style={styles.statsNumber}>
                        {stats?.workers || 0}
                    </Text>

                    <Text style={styles.statsLabel}>
                        Workers
                    </Text>

                </View>

                <View style={styles.statsCard}>

                    <Text style={styles.statsNumber}>
                        {stats?.pendingWithdrawals || 0}
                    </Text>

                    <Text style={styles.statsLabel}>
                        Pending
                    </Text>

                </View>

            </View>

            <Text style={styles.sectionTitle}>
                Withdrawal Requests
            </Text>


            <FlatList

                data={withdrawals}

                showsVerticalScrollIndicator={false}

                contentContainerStyle={{
                    paddingBottom: 120
                }}

                ListEmptyComponent={

                    <View
                        style={{
                            marginTop: 100,
                            alignItems: "center"
                        }}
                    >

                        <Text
                            style={{
                                fontSize: 18,
                                color: "#999"
                            }}
                        >
                            No withdrawal requests
                        </Text>

                    </View>

                }

                keyExtractor={(item, index) =>

                    item?._id?.toString() ||

                    index.toString()

                }

                renderItem={({ item }) => (

                    <View style={styles.card}>

                        <View style={styles.topSection}>

                            <Image

                                source={{

                                    uri:

                                        item.workerPhoto ||

                                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"

                                }}

                                style={styles.workerImage}

                            />

                            <View style={styles.workerInfo}>

                                <Text style={styles.name}>
                                    {item?.workerName || "Worker"}
                                </Text>

                                <Text style={styles.amount}>
                                    ₹{item.amount}
                                </Text>

                            </View>

                        </View>

                        <Text style={styles.upi}>
                            UPI: {item.upiId || "N/A"}
                        </Text>

                        <Text style={styles.upi}>
                            Bank: {item.bankName || "N/A"}
                        </Text>

                        <Text style={styles.upi}>
                            Account: {item.accountNumber || "N/A"}
                        </Text>

                        <Text style={styles.upi}>
                            IFSC: {item.ifsc || "N/A"}
                        </Text>

                        <Text

                            style={[

                                styles.status,

                                {

                                    color:

                                        item.status === "approved"
                                            ? "#00C853"
                                            : item.status === "rejected"
                                                ? "#FF3B30"
                                                : "#FF9800"

                                }

                            ]}

                        >

                            {item.status}

                        </Text>

                        {

                            item.approvedAt && (

                                <Text style={styles.date}>

                                    Paid:

                                    {

                                        new Date(
                                            item.approvedAt
                                        ).toLocaleDateString()

                                    }

                                </Text>

                            )

                        }

                        {

                            item.status === "pending" && (

                                <View style={styles.row}>

                                    <TouchableOpacity

                                        style={styles.approveButton}

                                        onPress={() =>

                                            Alert.alert(

                                                "Approve Withdrawal",

                                                `Pay ₹${item.amount} to ${item.workerName}?`,

                                                [

                                                    {
                                                        text: "Cancel",
                                                        style: "cancel"
                                                    },

                                                    {
                                                        text: "Approve",

                                                        onPress: () =>
                                                            approveWithdrawal(
                                                                item._id
                                                            )
                                                    }

                                                ]

                                            )

                                        }

                                    >

                                        <Text style={styles.buttonText}>
                                            Approve
                                        </Text>

                                    </TouchableOpacity>

                                    <TouchableOpacity

                                        style={styles.rejectButton}

                                        onPress={() =>

                                            Alert.alert(

                                                "Reject Withdrawal",

                                                `Reject ₹${item.amount} withdrawal?`,

                                                [

                                                    {
                                                        text: "Cancel",
                                                        style: "cancel"
                                                    },

                                                    {
                                                        text: "Reject",

                                                        onPress: () =>
                                                            rejectWithdrawal(
                                                                item._id
                                                            )
                                                    }

                                                ]

                                            )

                                        }

                                    >

                                        <Text style={styles.buttonText}>
                                            Reject
                                        </Text>

                                    </TouchableOpacity>

                                </View>

                            )

                        }

                    </View>

                )}

            />

        </View>

    );

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F5F5F7",
        paddingTop: 70,
        paddingHorizontal: 20
    },

    heading: {
        fontSize: 40,
        fontWeight: "bold",
        marginBottom: 30,
        color: "#000"
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 28,
        padding: 22,
        marginBottom: 22,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 5
    },

    name: {
        fontSize: 22,
        fontWeight: "bold"
    },

    amount: {
        fontSize: 42,
        fontWeight: "bold",
        marginTop: 14,
        color: "#2962FF"
    },

    upi: {
        marginTop: 8,
        fontSize: 17,
        color: "#555",
        lineHeight: 24
    },

    status: {
        marginTop: 18,
        fontSize: 20,
        fontWeight: "bold",
        textTransform: "capitalize"
    },

    row: {
        flexDirection: "row",
        marginTop: 20
    },

    approveButton: {
        flex: 1,
        backgroundColor: "#00C853",
        padding: 15,
        borderRadius: 16,
        alignItems: "center",
        marginRight: 5
    },

    rejectButton: {
        flex: 1,
        backgroundColor: "#FF3B30",
        padding: 15,
        borderRadius: 16,
        alignItems: "center",
        marginLeft: 5
    },

    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold"
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15
    },

    statsCard: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 28,
        paddingVertical: 30,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4
    },

    statsNumber: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2962FF"
    },

    statsLabel: {
        marginTop: 8,
        fontSize: 16,
        color: "#555"
    },

    date: {
        marginTop: 6,
        color: "#666",
        fontSize: 14
    },

    sectionTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 20
    },

    topSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20
    },

    workerImage: {
        width: 75,
        height: 75,
        borderRadius: 37.5,
        backgroundColor: "#eee",
        marginRight: 16
    },

    workerInfo: {
        flex: 1
    },
    

    
    

});