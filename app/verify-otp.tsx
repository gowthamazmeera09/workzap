import React, { useEffect, useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert
} from "react-native";

import AsyncStorage from
    "@react-native-async-storage/async-storage";

import {
    router,
    useLocalSearchParams
} from "expo-router";

import API_URL from "@/constants/api";

export default function VerifyOtpScreen() {

    const {

        email,

        purpose

    } = useLocalSearchParams<{

        email: string;

        purpose: string;

    }>();

    const [otp, setOtp] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [seconds, setSeconds] =
        useState(60);

    useEffect(() => {

        if (seconds <= 0) return;

        const timer = setInterval(() => {

            setSeconds((prev) => prev - 1);

        }, 1000);

        return () => clearInterval(timer);

    }, [seconds]);

    const verifyOtp =
        async () => {

            try {

                if (!otp) {

                    Alert.alert(

                        "Please enter OTP"

                    );

                    return;

                }

                setLoading(true);

                const endpoint =

                    purpose === "register"

                        ? "/verify-register-otp"

                        : "/verify-login-otp";

                const response =
                    await fetch(

                        `${API_URL}/api/auth${endpoint}`,

                        {

                            method: "POST",

                            headers: {

                                "Content-Type": "application/json"

                            },

                            body: JSON.stringify({

                                email,

                                otp

                            })

                        }

                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    Alert.alert(

                        "Error",

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

                    const workerResponse =
                        await fetch(

                            `${API_URL}/api/workers/user/${data.user._id}`

                        );

                    const worker =
                        await workerResponse.json();

                    await AsyncStorage.setItem(

                        "workerProfile",

                        JSON.stringify(

                            worker

                        )

                    );

                }

                router.replace(

                    "/(tabs)"

                );

            }

            catch (err) {

                console.log(err);

                Alert.alert(

                    "Error",

                    "Something went wrong."

                );

            }

            finally {

                setLoading(false);

            }

        };
    const resendOtp =
        async () => {

            try {

                const endpoint =

                    purpose === "register"

                        ? "/resend-register-otp"

                        : "/resend-login-otp";

                const response =
                    await fetch(

                        `${API_URL}/api/auth${endpoint}`,

                        {

                            method: "POST",

                            headers: {

                                "Content-Type": "application/json"

                            },

                            body: JSON.stringify({

                                email

                            })

                        }

                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    Alert.alert(

                        "Error",

                        data.message

                    );

                    return;

                }

                Alert.alert(

                    "Success",

                    "OTP sent successfully."

                );

                setSeconds(60);

            }

            catch (err) {

                console.log(err);

            }

        };

    return (

        <View style={styles.container}>

            <Text style={styles.title}>

                Verify OTP

            </Text>

            <Text style={styles.subtitle}>

                OTP has been sent to

            </Text>

            <Text style={styles.email}>

                {email}

            </Text>

            <TextInput

                placeholder="Enter 6-digit OTP"

                placeholderTextColor="#888"

                value={otp}

                onChangeText={setOtp}

                keyboardType="number-pad"

                maxLength={6}

                style={styles.input}

                cursorColor="#2962FF"

                selectionColor="#2962FF"

            />

            <TouchableOpacity

                style={styles.button}

                onPress={verifyOtp}

                disabled={loading}

            >

                <Text style={styles.buttonText}>

                    {

                        loading

                            ? "Verifying..."

                            : "Verify OTP"

                    }

                </Text>

            </TouchableOpacity>

            {

                seconds > 0 ? (

                    <Text style={styles.timer}>

                        Resend OTP in {seconds}s

                    </Text>

                ) : (

                    <TouchableOpacity

                        onPress={resendOtp}

                    >

                        <Text style={styles.resend}>

                            Resend OTP

                        </Text>

                    </TouchableOpacity>

                )

            }

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
        marginBottom: 20
    },

    subtitle: {
        textAlign: "center",
        fontSize: 16,
        color: "#666"
    },

    email: {
        textAlign: "center",
        fontSize: 17,
        fontWeight: "bold",
        color: "#2962FF",
        marginTop: 8,
        marginBottom: 25
    },

    input: {
        backgroundColor: "#F5F5F5",
        borderRadius: 14,
        paddingHorizontal: 15,
        height: 55,
        marginBottom: 20,
        fontSize: 20,
        color: "#000",
        textAlign: "center",
        letterSpacing: 8
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

    timer: {
        marginTop: 25,
        textAlign: "center",
        color: "#666",
        fontSize: 16
    },

    resend: {
        marginTop: 25,
        textAlign: "center",
        color: "#2962FF",
        fontWeight: "bold",
        fontSize: 16
    }

});