import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";

import {
  useState,
  useEffect
} from "react";

import * as ImagePicker from
  "expo-image-picker";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import {
  router
} from "expo-router";

import * as Location
  from "expo-location";

import { Dropdown }
  from "react-native-element-dropdown";

  const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

const workOptions = {

  Painter: [

    "Interior Painter",

    "Exterior Painter",

    "Wood Painter",

    "Wall Designer"

  ],

  Teacher: [

    "Maths",

    "Physics",

    "Chemistry",

    "Biology",

    "English",

    "Class 1-5",

    "Class 6-10",

    "Inter"

  ],

  Driver: [

    "Cab Driver",

    "Truck Driver",

    "Auto Driver",

    "Personal Driver"

  ],

  Electrician: [

    "House Wiring",

    "AC Repair",

    "Motor Repair"

  ],

  Mason: [

    "Tiles Work",

    "Building Mason",

    "Granite Work"

  ]

};

export default function BecomeWorker() {

  const [user, setUser] =
    useState<any>(null);

  const [email, setEmail] =
    useState("");

  const [selectedCategory,
    setSelectedCategory] =
    useState("");

  const [selectedSubCategory,
    setSelectedSubCategory] =
    useState("");

  const [upiId, setUpiId] =
    useState("");

  const [bankName, setBankName] =
    useState("");

  const [accountNumber, setAccountNumber] =
    useState("");

  const [ifsc, setIfsc] =
    useState("");

  const [aadharCard, setAadharCard] =
    useState("");

  const [image, setImage] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [latitude, setLatitude] =
    useState(0);

  const [longitude, setLongitude] =
    useState(0);

  useEffect(() => {

    loadUser();

  }, []);

  const loadUser =
    async () => {

      const savedUser =
        await AsyncStorage.getItem(
          "user"
        );

      if (savedUser) {

        setUser(
          JSON.parse(savedUser)
        );

      }

    };

  const pickImage =
    async () => {

      const result =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,

          quality: 0.7

        });

      if (!result.canceled) {

        setImage(
          result.assets[0].uri
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

        // GET ADDRESS
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

            [

              place.name,

              place.street,

              place.district,

              place.city,

              place.subregion,

              place.region

            ]

              .filter(Boolean)

              .join(", ");

          setAddress(fullAddress);

          Alert.alert(
            "Location Updated"
          );

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

  const becomeWorker =
    async () => {

      try {
        if (!address) {

          Alert.alert(
            "Please enter location"
          );

          return;

        }
        const coords =
          await searchLocation();

        const formData =
          new FormData();

        formData.append(
          "userId",
          user._id
        );

        formData.append(
          "name",
          user.name
        );

        formData.append(
          "phone",
          user.phone
        );

        formData.append(
          "email",
          email
        );

        formData.append(

          "serviceTypes",

          JSON.stringify([

            `${selectedCategory} - ${selectedSubCategory}`

          ])

        );

        formData.append(
          "aadharCard",
          aadharCard
        );

        formData.append(
          "upiId",
          upiId
        );

        formData.append(
          "bankName",
          bankName
        );

        formData.append(
          "accountNumber",
          accountNumber
        );

        formData.append(
          "ifsc",
          ifsc
        );
        formData.append(
          "address",
          address
        );

        formData.append(

          "latitude",

          (
            coords?.latitude ||
            latitude ||
            0
          ).toString()

        );

        formData.append(

          "longitude",

          (
            coords?.longitude ||
            longitude ||
            0
          ).toString()

        );

        // IMAGE
        formData.append(
          "image",
          {

            uri: image,

            type: "image/jpeg",

            name: "worker.jpg"

          } as any
        );

        const response =
          await fetch(

            `${API_URL}/api/workers/create`,

            {

              method: "POST",

              body: formData

            }

          );

        const data =
          await response.json();
        await AsyncStorage.setItem(

          "workerProfile",

          JSON.stringify(data.worker)

        );

        if (!response.ok) {

          Alert.alert(
            data.message
          );

          return;

        }

        // UPDATE USER
        const updatedUser = {

          ...user,

          isWorker: true

        };

        await AsyncStorage.setItem(

          "user",

          JSON.stringify(
            updatedUser
          )

        );

        await AsyncStorage.setItem(

          "workerProfile",

          JSON.stringify(data.worker)

        );

        Alert.alert(
          "Worker Profile Created"
        );

        router.replace(
          "/worker"
        );

      } catch (err) {

        console.log(err);

      }

    };


  return (

    <ScrollView

      style={styles.container}

      showsVerticalScrollIndicator={false}

      contentContainerStyle={{
        paddingBottom: 50
      }}

    >

      <Text style={styles.heading}>
        Become Worker
      </Text>

      <TouchableOpacity
        onPress={pickImage}
      >

        <Image

          source={{

            uri:

              image ||

              "https://cdn-icons-png.flaticon.com/512/149/149071.png"

          }}

          style={styles.image}

          resizeMode="cover"

        />

      </TouchableOpacity>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <Text style={styles.label}>
        Choose Work
      </Text>

      <Dropdown

        style={styles.dropdown}

        data={

          Object.keys(workOptions)
            .map(item => ({

              label: item,

              value: item

            }))

        }

        labelField="label"

        valueField="value"

        placeholder="Select Work"

        value={selectedCategory}

        onChange={item => {

          setSelectedCategory(
            item.value
          );

          setSelectedSubCategory("");

        }}

      />
      {
        selectedCategory !== "" && (

          <>

            <Text style={styles.label}>
              Choose Specialization
            </Text>

            <Dropdown

              style={styles.dropdown}

              data={

                workOptions[
                  selectedCategory
                ].map(item => ({

                  label: item,

                  value: item

                }))

              }

              labelField="label"

              valueField="value"

              placeholder="Select Specialization"

              value={selectedSubCategory}

              onChange={item =>

                setSelectedSubCategory(
                  item.value
                )

              }

            />

          </>

        )
      }

      <TextInput
        placeholder="Aadhar Card Number"
        value={aadharCard}
        onChangeText={setAadharCard}
        style={styles.input}
      />

      <TextInput
        placeholder="UPI ID"
        value={upiId}
        onChangeText={setUpiId}
        style={styles.input}
      />

      <TextInput
        placeholder="Bank Name"
        value={bankName}
        onChangeText={setBankName}
        style={styles.input}
      />

      <TextInput
        placeholder="Account Number"
        value={accountNumber}
        onChangeText={setAccountNumber}
        style={styles.input}
      />

      <TextInput
        placeholder="IFSC Code"
        value={ifsc}
        onChangeText={setIfsc}
        style={styles.input}
      />

      <TextInput

        placeholder="Location"

        value={address}

        onChangeText={setAddress}

        style={styles.input}

      />

      <TouchableOpacity

        style={styles.locationButton}

        onPress={getCurrentLocation}

      >

        <Text style={styles.locationText}>
          Use Current Location
        </Text>

      </TouchableOpacity>

      <TouchableOpacity

        style={styles.button}

        onPress={becomeWorker}

      >

        <Text style={styles.buttonText}>
          Submit
        </Text>

      </TouchableOpacity>

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: "#fff",

    paddingHorizontal: 20,

    paddingTop: 50

  },

  heading: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 20
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 100,
    alignSelf: "center",
    marginBottom: 20
  },

  input: {

    backgroundColor: "#F5F5F5",

    height: 50,

    borderRadius: 12,

    paddingHorizontal: 15,

    marginBottom: 10,

    fontSize: 15

  },

  button: {

    backgroundColor: "#2962FF",

    height: 50,

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",

    marginTop: 10

  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },
  locationButton: {

    backgroundColor: "#000",

    height: 48,

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 10

  },

  locationText: {

    color: "#fff",

    fontSize: 16,

    fontWeight: "bold"

  },
  label: {

    fontSize: 16,

    fontWeight: "bold",

    marginBottom: 10,

    marginTop: 10

  },
  dropdown: {

    height: 55,

    backgroundColor: "#F5F5F5",

    borderRadius: 12,

    paddingHorizontal: 15,

    marginBottom: 15

  },

});