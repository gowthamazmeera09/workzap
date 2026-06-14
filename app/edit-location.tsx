import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert
} from "react-native";

import {
    useEffect,
    useState
} from "react";

import AsyncStorage from
    "@react-native-async-storage/async-storage";

import {
    router
} from "expo-router";

import * as Location
    from "expo-location";

export default function EditLocation() {

    const [worker, setWorker] =
        useState<any>(null);

    const [address, setAddress] =
        useState("");

    const [latitude, setLatitude] =
        useState(0);

    const [longitude, setLongitude] =
        useState(0);

    useEffect(() => {

        loadWorker();

    }, []);

    const loadWorker =
        async () => {

            const saved =
                await AsyncStorage.getItem(
                    "workerProfile"
                );

            if (saved) {

                const parsed =
                    JSON.parse(saved);

                setWorker(parsed);

                setAddress(
                    parsed.address || ""
                );

            }

        };

    const getCurrentLocation =
        async () => {

            try {

                const { status } =

                    await Location
                        .requestForegroundPermissionsAsync();

                if (status !== "granted") {

                    Alert.alert(
                        "Location permission denied"
                    );

                    return;

                }

                const location =

                    await Location
                        .getCurrentPositionAsync({

                            accuracy:
                                Location.Accuracy.BestForNavigation

                        });

                const lat =
                    location.coords.latitude;

                const lng =
                    location.coords.longitude;

                setLatitude(lat);

                setLongitude(lng);

                const reverseGeocode =

                    await Location
                        .reverseGeocodeAsync({

                            latitude: lat,

                            longitude: lng

                        });

                if (reverseGeocode.length > 0) {

                    const place =
                        reverseGeocode[0];

                    const fullAddress =

                        `${place.name || ""}
          ${place.street || ""}
          ${place.city || ""}
          ${place.region || ""}`;

                    setAddress(fullAddress);

                }

            } catch (err) {

                console.log(err);

            }

        };

    const searchLocation =
        async () => {

            try {

                const result =

                    await Location
                        .geocodeAsync(address);

                if (result.length > 0) {

                    return {

                        latitude:
                            result[0].latitude,

                        longitude:
                            result[0].longitude

                    };

                }

                return null;

            } catch (err) {

                console.log(err);

                return null;

            }

        };

    const updateLocation =
        async () => {

            try {
                const coords =
                    await searchLocation();

                const response =
                    await fetch(

                        `http://192.168.2.225:5000/api/workers/update-location/${worker._id}`,

                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                address,

                                latitude:
                                    coords?.latitude || latitude,

                                longitude:
                                    coords?.longitude || longitude

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

                // UPDATE LOCAL STORAGE
                const updatedWorker = {

                    ...worker,

                    address,

                    location: {

                        type: "Point",

                        coordinates: [

                            coords?.longitude || longitude,

                            coords?.latitude || latitude

                        ]

                    }

                };

                await AsyncStorage.setItem(

                    "workerProfile",

                    JSON.stringify(
                        updatedWorker
                    )

                );

                Alert.alert(
                    "Location Updated"
                );

                router.back();

            } catch (err) {

                console.log(err);

            }

        };

    return (

        <View style={styles.container}>

            <Text style={styles.heading}>
                Edit Location
            </Text>

            <TextInput

                placeholder="Enter Location"

                value={address}

                onChangeText={setAddress}

                style={styles.input}

            />
            <TouchableOpacity

                style={styles.locationButton}

                onPress={getCurrentLocation}

            >

                <Text style={styles.buttonText}>
                    Use Current Location
                </Text>

            </TouchableOpacity>

            <TouchableOpacity

                style={styles.button}

                onPress={updateLocation}

            >

                <Text style={styles.buttonText}>
                    Save Location
                </Text>

            </TouchableOpacity>

        </View>

    );

}

const styles =
    StyleSheet.create({

        container: {

            flex: 1,

            backgroundColor: "#fff",

            padding: 20,

            justifyContent: "center"

        },

        heading: {

            fontSize: 30,

            fontWeight: "bold",

            marginBottom: 30

        },

        input: {

            backgroundColor: "#F5F5F5",

            height: 55,

            borderRadius: 14,

            paddingHorizontal: 15,

            marginBottom: 20,

            fontSize: 16

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
        locationButton: {

            backgroundColor: "#000",

            height: 55,

            borderRadius: 14,

            justifyContent: "center",

            alignItems: "center",

            marginBottom: 15

        },

    });