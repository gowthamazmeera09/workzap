import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Linking,
    Modal,
    Animated,
    TextInput,
    Image
} from "react-native";

import {
    useEffect,
    useState,
    useRef
} from "react";
import io from "socket.io-client";
import AsyncStorage from
    "@react-native-async-storage/async-storage";

import { Audio } from "expo-av";

import * as Location from "expo-location";
import { router } from "expo-router";
import QRCode from
    "react-native-qrcode-svg";

const socket =
    io("http://192.168.2.225:5000");

export default function WorkerScreen() {

    const [bookings, setBookings] =
        useState<any[]>([]);

    const [quoteAmount, setQuoteAmount] =
        useState("");

    const [quoteDescription, setQuoteDescription] =
        useState("");

    const [worker, setWorker] =
        useState<any>(null);

    const [notificationCount, setNotificationCount] =
        useState(0);

    const [qrModal, setQrModal] =
        useState(false);

    const [selectedBooking, setSelectedBooking] =
        useState<any>(null);

    const [menuOpen, setMenuOpen] =
        useState(false);

    const slideAnim =
        useRef(
            new Animated.Value(-320)
        ).current;
    const [user, setUser] =
        useState<any>(null);


    const fetchBookings =
        async (workerId: string) => {

            try {

                const response =
                    await fetch(
                        `http://192.168.2.225:5000/api/bookings/worker/${workerId}`
                    );

                const data =
                    await response.json();
                console.log(data);

                setBookings(data);

            } catch (err) {

                console.log(err);

            }

        };

    const loadNotificationCount = async () => {
        try {
            const saved =
                await AsyncStorage.getItem(
                    "notifications"
                );

            const readCount =
                await AsyncStorage.getItem(
                    "notification_read_count"
                );

            const notifications =
                saved
                    ? JSON.parse(saved)
                    : [];

            const read =
                Number(readCount || 0);

            setNotificationCount(
                Math.max(
                    notifications.length - read,
                    0
                )
            );

        } catch (err) {
            console.log(err);
        }
    };

    const saveNotification =
        async (
            title: string,
            message: string
        ) => {

            try {

                const existing =
                    await AsyncStorage.getItem(
                        "notifications"
                    );

                const notifications =
                    existing
                        ? JSON.parse(existing)
                        : [];

                notifications.push({

                    title,

                    message,

                    time:
                        new Date()
                            .toLocaleString()

                });

                await AsyncStorage.setItem(

                    "notifications",

                    JSON.stringify(
                        notifications
                    )

                );

                // PLAY SOUND
                const { sound } =
                    await Audio.Sound.createAsync(

                        require(
                            "../../assets/images/notification.mp3"
                        )

                    );

                await sound.playAsync();

            } catch (err) {

                console.log(err);

            }

        };



    // SOCKET CONNECTION
    useEffect(() => {

        const loadWorker =
            async () => {

                try {

                    const savedWorker =
                        await AsyncStorage.getItem(
                            "workerProfile"
                        );

                    if (savedWorker) {

                        const parsedWorker =
                            JSON.parse(savedWorker);


                        setWorker(parsedWorker);

                        fetchBookings(
                            parsedWorker._id
                        );

                    }

                } catch (err) {

                    console.log(err);

                }

            };

        loadWorker();

        loadNotificationCount();

        const notificationInterval =
            setInterval(() => {
                loadNotificationCount();
            }, 1000);

        // LIVE LOCATION UPDATE
        const startTracking =
            async () => {

                let { status } =
                    await Location
                        .requestForegroundPermissionsAsync();

                if (status !== "granted") {
                    return;
                }
                // SEND FIRST LOCATION IMMEDIATELY
                const currentLocation =
                    await Location.getCurrentPositionAsync({});

                const savedWorker =
                    await AsyncStorage.getItem(
                        "workerProfile"
                    );

                if (!savedWorker) return;

                const parsedWorker =
                    JSON.parse(savedWorker);

                socket.emit(
                    "workerLocationUpdate",
                    {

                        workerId:
                            parsedWorker._id,

                        latitude:
                            currentLocation.coords.latitude,

                        longitude:
                            currentLocation.coords.longitude

                    }
                );

                Location.watchPositionAsync(

                    {
                        accuracy:
                            Location.Accuracy.High,

                        timeInterval: 5000,

                        distanceInterval: 10
                    },

                    async (loc) => {

                        const savedWorker =
                            await AsyncStorage.getItem(
                                "workerProfile"
                            );

                        if (!savedWorker) return;

                        const parsedWorker =
                            JSON.parse(savedWorker);

                        socket.emit(
                            "workerLocationUpdate",
                            {

                                workerId:
                                    parsedWorker._id,

                                latitude:
                                    loc.coords.latitude,

                                longitude:
                                    loc.coords.longitude

                            }
                        );

                    }

                );

            };

        startTracking();
        const interval =
            setInterval(async () => {

                const savedWorker =
                    await AsyncStorage.getItem(
                        "workerProfile"
                    );

                if (!savedWorker) return;

                const parsedWorker =
                    JSON.parse(savedWorker);

                fetchBookings(
                    parsedWorker._id
                );

            }, 3000);

        // NEW BOOKING
        // NEW BOOKING
        socket.on(
            "newBooking",
            async (booking) => {

                const savedWorker =
                    await AsyncStorage.getItem(
                        "workerProfile"
                    );

                const parsedWorker =
                    savedWorker
                        ? JSON.parse(savedWorker)
                        : null;

                // ONLY FOR THIS WORKER
                if (
                    booking.workerId !==
                    parsedWorker?._id
                ) {
                    return;
                }

                // PLAY SOUND ONLY FOR MATCHED WORKER
                await saveNotification(

                    "New Booking",

                    `${booking.serviceType} booking received`

                );

                setBookings(prev => {

                    const exists =
                        prev.find(
                            item =>
                                item._id === booking._id
                        );

                    if (exists) {
                        return prev;
                    }

                    return [
                        booking,
                        ...prev
                    ];

                });

            }
        );


        // ACCEPTED
        socket.on(
            "bookingAccepted",
            async (updatedBooking) => {

                await saveNotification(

                    "Booking Accepted",

                    "Booking accepted successfully"

                );

                setBookings(prev =>
                    prev.map(item =>
                        item._id === updatedBooking._id
                            ? updatedBooking
                            : item
                    )
                );

            }
        );


        // ARRIVED
        socket.on(
            "workerArrived",
            async (updatedBooking) => {

                await saveNotification(

                    "Arrived",

                    "Worker arrived at location"

                );

                setBookings(prev =>
                    prev.map(item =>
                        item._id === updatedBooking._id
                            ? updatedBooking
                            : item
                    )
                );

            }
        );


        // QUOTE SUBMITTED
        socket.on(
            "quoteSubmitted",
            async (updatedBooking) => {

                await saveNotification(

                    "Quote Submitted",

                    `Quotation ₹${updatedBooking.quoteAmount} submitted`

                );

                setBookings(prev =>
                    prev.map(item =>
                        item._id === updatedBooking._id
                            ? updatedBooking
                            : item
                    )
                );

            }
        );


        // QUOTE APPROVED
        socket.on(
            "quoteApproved",
            async (updatedBooking) => {

                await saveNotification(

                    "Quote Approved",

                    "User approved quotation"

                );

                setBookings(prev =>
                    prev.map(item =>
                        item._id === updatedBooking._id
                            ? updatedBooking
                            : item
                    )
                );

            }
        );


        // QUOTE REJECTED
        socket.on(
            "quoteRejected",
            async (updatedBooking) => {

                await saveNotification(

                    "Quote Rejected",

                    "User rejected quotation"

                );

                setBookings(prev =>
                    prev.map(item =>
                        item._id === updatedBooking._id
                            ? updatedBooking
                            : item
                    )
                );

            }
        );


        // WORK STARTED
        socket.on(
            "workStarted",
            async (updatedBooking) => {

                await saveNotification(

                    "Work Started",

                    "Work started successfully"

                );

                setBookings(prev =>
                    prev.map(item =>
                        item._id === updatedBooking._id
                            ? updatedBooking
                            : item
                    )
                );

            }
        );


        // WORK COMPLETED
        socket.on(
            "workCompleted",
            async (updatedBooking) => {

                await saveNotification(

                    "Work Completed",

                    "Work completed successfully"

                );

                setBookings(prev =>
                    prev.map(item =>
                        item._id === updatedBooking._id
                            ? updatedBooking
                            : item
                    )
                );

            }
        );


        // PAYMENT RECEIVED
        // PAYMENT RECEIVED
        socket.on(
            "paymentDone",
            async (updatedBooking) => {

                await saveNotification(

                    "Payment Received",

                    `₹${updatedBooking.workerEarning} received`

                );

                setBookings(prev =>
                    prev.map(item =>
                        item._id === updatedBooking._id
                            ? updatedBooking
                            : item
                    )
                );

                // REFRESH WALLET INSTANTLY
                try {

                    const savedWorker =
                        await AsyncStorage.getItem(
                            "workerProfile"
                        );

                    if (!savedWorker) return;

                    const parsedWorker =
                        JSON.parse(savedWorker);

                    const response =
                        await fetch(

                            `http://192.168.2.225:5000/api/workers/${parsedWorker._id}`

                        );

                    const updatedWorker =
                        await response.json();

                    await AsyncStorage.setItem(

                        "workerProfile",

                        JSON.stringify(updatedWorker)

                    );

                    setWorker(updatedWorker);

                } catch (err) {

                    console.log(err);

                }

            }
        );


        // BOOKING CANCELLED
        socket.on(
            "bookingRejected",
            async (updatedBooking) => {

                await saveNotification(

                    "Booking Cancelled",

                    "Booking was cancelled"

                );

                setBookings(prev =>
                    prev.filter(
                        item =>
                            item._id !==
                            updatedBooking._id
                    )
                );

            }
        );


        return () => {

            clearInterval(interval);

            clearInterval(notificationInterval);

            socket.off("newBooking");
            socket.off("bookingAccepted");
            socket.off("workerArrived");
            socket.off("workStarted");
            socket.off("workCompleted");
            socket.off("bookingRejected");

        };

    }, []);



    // ACCEPT BOOKING
    const acceptBooking =
        async (bookingId: string) => {

            try {

                await fetch(
                    `http://192.168.2.225:5000/api/bookings/accept/${bookingId}`,
                    {
                        method: "POST"
                    }
                );

            } catch (err) {

                console.log(err);

            }

        };


    // ARRIVED
    const arrivedBooking =
        async (bookingId: string) => {

            try {

                await fetch(
                    `http://192.168.2.225:5000/api/bookings/arrived/${bookingId}`,
                    {
                        method: "POST"
                    }
                );

            } catch (err) {

                console.log(err);

            }

        };


    // START WORK
    const startWork =
        async (bookingId: string) => {

            try {

                await fetch(
                    `http://192.168.2.225:5000/api/bookings/start/${bookingId}`,
                    {
                        method: "POST"
                    }
                );

            } catch (err) {

                console.log(err);

            }

        };


    // COMPLETE WORK
    const completeWork =
        async (bookingId: string) => {

            try {

                await fetch(
                    `http://192.168.2.225:5000/api/bookings/complete/${bookingId}`,
                    {
                        method: "POST"
                    }
                );

            } catch (err) {

                console.log(err);

            }

        };


    // CALL USER
    const callUser =
        (phone: string) => {

            Linking.openURL(
                `tel:${phone}`
            );

        };


    // CANCEL BOOKING
    const cancelBooking =
        async (bookingId: string) => {

            try {

                await fetch(
                    `http://192.168.2.225:5000/api/bookings/reject/${bookingId}`,
                    {
                        method: "POST"
                    }
                );
                setBookings(prev =>
                    prev.filter(
                        item =>
                            item._id !== bookingId
                    )
                );

            } catch (err) {

                console.log(err);

            }

        };

    const toggleMenu = () => {

        Animated.timing(

            slideAnim,

            {

                toValue:
                    menuOpen
                        ? -320
                        : 0,

                duration: 350,

                useNativeDriver: true

            }

        ).start();

        setMenuOpen(!menuOpen);

    };

    if (!worker) {

        return (

            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    padding: 25
                }}
            >

                <Text
                    style={{
                        fontSize: 34,
                        fontWeight: "bold",
                        marginBottom: 15
                    }}
                >
                    Become a Worker
                </Text>

                <Text
                    style={{
                        fontSize: 16,
                        color: "#666",
                        textAlign: "center",
                        marginBottom: 40
                    }}
                >
                    Start earning money with WorkZap
                </Text>

                <TouchableOpacity

                    style={{
                        backgroundColor: "#2962FF",
                        paddingVertical: 18,
                        paddingHorizontal: 40,
                        borderRadius: 18
                    }}

                    onPress={() =>
                        router.push(
                            "/become-worker"
                        )
                    }

                >

                    <Text
                        style={{
                            color: "#fff",
                            fontSize: 18,
                            fontWeight: "bold"
                        }}
                    >
                        Be a Worker
                    </Text>

                </TouchableOpacity>

            </View>

        );

    }


    return (

        <View style={styles.container}>
            <TouchableOpacity

                style={styles.profileTopButton}

                onPress={toggleMenu}

            >

                <Image

                    source={{

                        uri:

                            worker?.image ||

                            "https://via.placeholder.com/150"

                    }}

                    style={styles.profileImage}

                    resizeMode="cover"

                />

            </TouchableOpacity>

            <Text style={styles.heading}>

                {worker?.name || "Worker"}

            </Text>
            <TouchableOpacity

                style={styles.notificationButton}

                onPress={() =>
                    router.push(
                        "/notifications"
                    )
                }

                onLongPress={() => {

                    router.push(
                        "/admin-login"
                    );

                }}

                delayLongPress={5000}

            >

                <>
                    <Text style={styles.notificationText}>
                        🔔
                    </Text>

                    {notificationCount > 0 && (

                        <View style={styles.badge}>

                            <Text style={styles.badgeText}>
                                {notificationCount}
                            </Text>

                        </View>

                    )}
                </>

            </TouchableOpacity>
            {
                menuOpen && (

                    <TouchableOpacity

                        activeOpacity={1}

                        onPress={toggleMenu}

                        style={styles.overlay}

                    />

                )
            }
            <Animated.View

                style={[

                    styles.drawer,

                    {
                        transform: [
                            {
                                translateX:
                                    slideAnim
                            }
                        ]
                    }

                ]}

            >

                {/* PROFILE */}
                <View style={styles.profileContainer}>

                    <Image

                        source={{

                            uri:

                                worker?.image ||

                                "https://via.placeholder.com/150"

                        }}

                        style={styles.mainProfileImage}

                        resizeMode="cover"

                    />

                    <Text style={styles.profileName}>

                        {worker?.name || "Worker"}

                    </Text>

                    <Text style={styles.profileRole}>

                        {worker?.serviceType || "Worker"}

                    </Text>

                </View>


                {/* MENU ITEMS */}

                <TouchableOpacity

                    style={styles.drawerItem}

                    onPress={() =>
                        router.push(
                            "/worker-profile"
                        )
                    }

                >

                    <Text style={styles.drawerText}>
                        👤 Profile
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity

                    style={styles.drawerItem}

                    onPress={() =>
                        router.push(
                            "/worker-transactions"
                        )
                    }

                >

                    <Text style={styles.drawerText}>
                        💰 Transactions
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity

                    style={styles.drawerItem}

                    onPress={() =>
                        router.push(
                            "/worker-withdraw"
                        )
                    }

                >

                    <Text style={styles.drawerText}>
                        🏦 Withdraw
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity

                    style={styles.drawerItem}

                    onPress={() =>
                        router.push(
                            "/notifications"
                        )
                    }

                >

                    <Text style={styles.drawerText}>
                        🔔 Notifications
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity

                    style={styles.logoutButton}

                    onPress={async () => {

                        await AsyncStorage.clear();

                        router.replace(
                            "/login"
                        );

                    }}

                >

                    <Text style={styles.logoutText}>
                        🚪 Logout
                    </Text>

                </TouchableOpacity>

            </Animated.View>

            <FlatList
                contentContainerStyle={{
                    paddingBottom: 120,
                    paddingTop: 20
                }}

                data={bookings}

                keyExtractor={(item) => item._id}

                renderItem={({ item }) => (

                    <View style={styles.card}>

                        <Text style={styles.service}>
                            {item.serviceType}
                        </Text>

                        <Text style={styles.status}>
                            Status: {item.status}
                        </Text>


                        {/* PENDING */}
                        {item.status === "pending" && (

                            <TouchableOpacity

                                style={styles.acceptButton}

                                onPress={() =>
                                    acceptBooking(item._id)
                                }
                            >

                                <Text style={styles.buttonText}>
                                    Accept Booking
                                </Text>

                            </TouchableOpacity>

                        )}


                        {/* ACCEPTED */}
                        {item.status === "accepted" && (

                            <>

                                <TouchableOpacity

                                    style={styles.goButton}

                                    onPress={() => {

                                        const lat =
                                            item.location?.lat;

                                        const lng =
                                            item.location?.lng;

                                        Linking.openURL(

                                            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

                                        );

                                    }}
                                >

                                    <Text style={styles.buttonText}>
                                        Go Location
                                    </Text>

                                </TouchableOpacity>

                                <TouchableOpacity

                                    style={styles.arrivedButton}

                                    onPress={() =>
                                        arrivedBooking(item._id)
                                    }
                                >

                                    <Text style={styles.buttonText}>
                                        I Arrived
                                    </Text>

                                </TouchableOpacity>

                                <View style={styles.row}>

                                    <TouchableOpacity

                                        style={styles.callButton}

                                        onPress={() =>
                                            callUser(
                                                item.userPhone ||
                                                "9876543210"
                                            )
                                        }
                                    >

                                        <Text style={styles.buttonText}>
                                            Call User
                                        </Text>

                                    </TouchableOpacity>

                                    <TouchableOpacity

                                        style={[

                                            styles.cancelButton,

                                            (
                                                item.status === "started" ||
                                                item.status === "completed"
                                            ) && {
                                                opacity: 0.5
                                            }

                                        ]}

                                        disabled={
                                            item.status === "started" ||
                                            item.status === "completed"
                                        }

                                        onPress={() =>
                                            cancelBooking(item._id)
                                        }
                                    >

                                        <Text style={styles.buttonText}>

                                            {
                                                item.status === "started"
                                                    ? "Work Started"
                                                    : item.status === "completed"
                                                        ? "Completed"
                                                        : "Cancel"
                                            }

                                        </Text>

                                    </TouchableOpacity>

                                </View>

                            </>

                        )}


                        {/* ARRIVED */}
                        {item.status === "arrived" && (

                            <View>

                                <TextInput

                                    placeholder="Enter quotation amount"

                                    value={quoteAmount}

                                    onChangeText={setQuoteAmount}

                                    keyboardType="numeric"

                                    style={styles.input}
                                />

                                <TextInput

                                    placeholder="Work description"

                                    value={quoteDescription}

                                    onChangeText={setQuoteDescription}

                                    multiline

                                    style={styles.descriptionInput}
                                />

                                <TouchableOpacity

                                    style={styles.quoteButton}

                                    onPress={async () => {

                                        try {

                                            await fetch(
                                                `http://192.168.2.225:5000/api/bookings/quote/${item._id}`,
                                                {

                                                    method: "POST",

                                                    headers: {
                                                        "Content-Type":
                                                            "application/json"
                                                    },

                                                    body: JSON.stringify({

                                                        quoteAmount,

                                                        quoteDescription

                                                    })

                                                }
                                            );

                                        } catch (err) {

                                            console.log(err);

                                        }

                                    }}
                                >

                                    <Text style={styles.buttonText}>
                                        Send Quote
                                    </Text>

                                </TouchableOpacity>

                            </View>

                        )}
                        {item.status === "quoted" && (

                            <View style={styles.waitingBox}>

                                <Text style={styles.waitingText}>

                                    Waiting for user approval...

                                </Text>

                            </View>

                        )}
                        {item.status === "approved" && (

                            <TouchableOpacity

                                style={styles.startButton}

                                onPress={() =>
                                    startWork(item._id)
                                }
                            >

                                <Text style={styles.buttonText}>
                                    Start Work
                                </Text>

                            </TouchableOpacity>

                        )}


                        {/* STARTED */}
                        {item.status === "started" && (

                            <TouchableOpacity

                                style={styles.completeButton}

                                onPress={() =>
                                    completeWork(item._id)
                                }
                            >

                                <Text style={styles.buttonText}>
                                    Complete Work
                                </Text>

                            </TouchableOpacity>

                        )}

                        {/* COMPLETED */}
                        {item.status === "completed" &&
                            item.paymentStatus === "pending" && (

                                <View>

                                    {/* QR PAYMENT */}
                                    <TouchableOpacity

                                        style={styles.qrButton}

                                        onPress={() => {

                                            setSelectedBooking(item);

                                            setQrModal(true);

                                        }}

                                    >

                                        <Text style={styles.buttonText}>
                                            Show QR Payment
                                        </Text>

                                    </TouchableOpacity>

                                    {/* CASH */}
                                    <TouchableOpacity

                                        style={styles.collectButton}

                                        onPress={async () => {

                                            try {

                                                await fetch(

                                                    `http://192.168.2.225:5000/api/bookings/pay/${item._id}`,

                                                    {

                                                        method: "POST",

                                                        headers: {
                                                            "Content-Type":
                                                                "application/json"
                                                        },

                                                        body: JSON.stringify({

                                                            paymentMethod:
                                                                "cash"

                                                        })

                                                    }

                                                );

                                            } catch (err) {

                                                console.log(err);

                                            }

                                        }}

                                    >

                                        <Text style={styles.buttonText}>
                                            Receive Cash
                                        </Text>

                                    </TouchableOpacity>

                                </View>

                            )}
                        {item.paymentStatus === "paid" && (

                            <View style={styles.completedBox}>

                                <Text style={styles.completedText}>

                                    ✅ Payment Received

                                </Text>

                                <Text style={styles.earningText}>

                                    Earned ₹{item.workerEarning}

                                </Text>

                            </View>

                        )}


                        {/* CANCELLED */}
                        {item.status === "cancelled" && (

                            <View style={styles.cancelledBox}>

                                <Text style={styles.cancelledText}>
                                    Booking Cancelled
                                </Text>

                            </View>

                        )}

                    </View>

                )
                }

            />
            <Modal
                visible={qrModal}
                transparent
                animationType="slide"
            >

                <View style={styles.modalContainer}>

                    <View style={styles.qrBox}>

                        <Text style={styles.qrTitle}>
                            Scan & Pay
                        </Text>

                        <QRCode

                            value={

                                `upi://pay?pa=6303497101@axl&pn=WorkZap&am=${selectedBooking?.quoteAmount}&cu=INR`

                            }

                            size={220}

                        />

                        <Text style={styles.qrAmount}>

                            ₹{selectedBooking?.quoteAmount}

                        </Text>

                        <TouchableOpacity

                            style={styles.completeButton}

                            onPress={async () => {

                                try {

                                    await fetch(

                                        `http://192.168.2.225:5000/api/bookings/pay/${selectedBooking._id}`,

                                        {

                                            method: "POST",

                                            headers: {
                                                "Content-Type":
                                                    "application/json"
                                            },

                                            body: JSON.stringify({

                                                paymentMethod:
                                                    "online"

                                            })

                                        }

                                    );

                                    setQrModal(false);

                                } catch (err) {

                                    console.log(err);

                                }

                            }}

                        >

                            <Text style={styles.buttonText}>
                                Payment Received
                            </Text>

                        </TouchableOpacity>

                        <TouchableOpacity

                            onPress={() =>
                                setQrModal(false)
                            }

                        >

                            <Text style={styles.closeText}>
                                Close
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

        </View >


    );

}


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F5F5F7",
        paddingTop: 70
    },

    heading: {

        fontSize: 24,

        fontWeight: "700",

        marginBottom: 20,

        marginLeft: 30,

        marginTop: 82,

        color: "#111"

    },

    card: {

        backgroundColor: "#fff",

        marginHorizontal: 18,

        marginBottom: 16,

        borderRadius: 24,

        padding: 18,

        elevation: 3,

        shadowColor: "#000",

        shadowOpacity: 0.06,

        shadowRadius: 8
    },

    service: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#111"
    },

    status: {
        marginTop: 12,
        fontSize: 16,
        color: "#666"
    },

    acceptButton: {
        backgroundColor: "#00C853",
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    arrivedButton: {
        backgroundColor: "#2962FF",
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    startButton: {
        backgroundColor: "#FF9800",
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    completeButton: {
        backgroundColor: "#9C27B0",
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    row: {
        flexDirection: "row",
        marginTop: 10
    },

    callButton: {
        flex: 1,
        backgroundColor: "#00C853",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginRight: 5
    },

    cancelButton: {
        flex: 1,
        backgroundColor: "#FF3B30",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginLeft: 5
    },

    completedBox: {

        backgroundColor: "#F1FFF3",

        marginTop: 24,

        paddingVertical: 20,
        paddingHorizontal: 15,

        borderRadius: 24,

        alignItems: "center"
    },

    completedText: {

        fontSize: 20,

        fontWeight: "bold",

        color: "#00C853",

        textAlign: "center"

    },
    earningText: {

        marginTop: 6,

        fontSize: 16,

        color: "#333",

        fontWeight: "600"

    },

    cancelledBox: {
        backgroundColor: "#FDECEC",
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    cancelledText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FF3B30"
    },

    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold"
    },
    input: {
        backgroundColor: "#fff",
        marginTop: 15,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: "#ddd"
    },

    descriptionInput: {
        backgroundColor: "#fff",
        marginTop: 10,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingTop: 15,
        height: 100,
        borderWidth: 1,
        borderColor: "#ddd"
    },

    quoteButton: {
        backgroundColor: "#2962FF",
        marginTop: 15,
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    waitingBox: {
        backgroundColor: "#FFF3E0",
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    waitingText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FF9800"
    },
    goButton: {
        backgroundColor: "#0091EA",
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    qrButton: {
        backgroundColor: "#2962FF",
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    collectButton: {
        backgroundColor: "#00C853",
        marginTop: 15,
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },

    qrBox: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 25,
        alignItems: "center"
    },

    qrTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20
    },

    qrAmount: {
        marginTop: 20,
        fontSize: 34,
        fontWeight: "bold"
    },

    closeText: {
        marginTop: 20,
        color: "#FF3B30",
        fontSize: 18,
        fontWeight: "bold"
    },
    profileTopButton: {

        position: "absolute",

        top: 74,

        left: 20,

        width: 58,
        height: 58,

        borderRadius: 100,

        backgroundColor: "#fff",

        justifyContent: "center",

        alignItems: "center",

        zIndex: 9999,

        elevation: 10,

        shadowColor: "#000",

        shadowOpacity: 0.15,

        shadowRadius: 10
    },


    drawer: {

        position: "absolute",

        left: 0,

        top: 0,

        bottom: 0,

        width: 320,

        backgroundColor: "#fff",

        zIndex: 99999,

        elevation: 30,

        paddingTop: 100,

        paddingHorizontal: 20,

        borderTopRightRadius: 40,

        borderBottomRightRadius: 40
    },

    bigProfile: {

        width: 100,

        height: 100,

        borderRadius: 100,

        backgroundColor: "#2962FF",

        justifyContent: "center",

        alignItems: "center"

    },

    drawerItem: {

        backgroundColor: "#F7F8FA",

        padding: 20,

        borderRadius: 22,

        marginBottom: 18,

        flexDirection: "row",

        alignItems: "center",

        elevation: 2
    },

    drawerText: {

        fontSize: 18,

        fontWeight: "600"

    },
    notificationButton: {

        position: "absolute",

        top: 74,
        width: 58,
        height: 58,

        right: 20,

        borderRadius: 100,

        backgroundColor: "#fff",

        justifyContent: "center",

        alignItems: "center",

        zIndex: 9999,

        elevation: 10,

        shadowColor: "#000",

        shadowOpacity: 0.15,

        shadowRadius: 10
    },
    notificationText: {

        fontSize: 20

    },

    profileImage: {

        width: 48,
        height: 48,

        borderRadius: 100

    },

    overlay: {

        position: "absolute",

        top: 0,

        left: 0,

        right: 0,

        bottom: 0,

        backgroundColor:
            "rgba(0,0,0,0.2)",

        zIndex: 9999

    },
    badge: {

        position: "absolute",

        top: 8,
        right: 8,

        backgroundColor: "#FF3B30",

        width: 18,
        height: 18,

        borderRadius: 20,

        justifyContent: "center",

        alignItems: "center"

    },

    badgeText: {

        color: "#fff",

        fontSize: 10,

        fontWeight: "bold"

    },
    logoutButton: {

        position: "absolute",

        bottom: 40,

        left: 20,

        right: 20,

        backgroundColor: "#F5F5F5",

        padding: 18,

        borderRadius: 18

    },

    logoutText: {

        fontSize: 18,

        fontWeight: "600",

        color: "#FF3B30"
    },
    profileContainer: {

        alignItems: "center",

        marginBottom: 35

    },

    mainProfileImage: {

        width: 120,

        height: 120,

        borderRadius: 100,

        marginBottom: 20

    },

    profileName: {

        fontSize: 28,

        fontWeight: "bold"

    },

    profileRole: {

        fontSize: 18,

        color: "#777",

        marginTop: 5

    },

});