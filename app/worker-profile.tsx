import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";

import {
  useEffect,
  useState
} from "react";

import {
  Ionicons
} from "@expo/vector-icons";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import {
  router
} from "expo-router";

import { Dropdown }
  from "react-native-element-dropdown";

  const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
  


const workOptions = {

  Painter: [

    "Interior Painter",

    "Exterior Painter",

    "Wood Painter"

  ],

  Teacher: [

    "Maths",

    "Physics",

    "Chemistry",

    "Biology"

  ],

  Driver: [

    "Cab Driver",

    "Truck Driver",

    "Auto Driver"

  ],

  Electrician: [

    "House Wiring",

    "AC Repair"

  ],

  Mason: [

    "Tiles Work",

    "Building Mason"

  ]

};


export default function WorkerProfile() {

  const [worker, setWorker] =
    useState<any>(null);

  const [selectedCategory,
    setSelectedCategory] =
    useState("");

  const [selectedSubCategory,
    setSelectedSubCategory] =
    useState("");

  useEffect(() => {

    loadWorker();



  }, []);

  const loadWorker =
    async () => {

      try {

        const savedWorker =
          await AsyncStorage.getItem(
            "workerProfile"
          );

        if (!savedWorker) return;

        const localWorker =
          JSON.parse(savedWorker);

        // FETCH LATEST WORKER
        const response =
          await fetch(

            `${API_URL}/api/workers/${localWorker._id}`

          );

        const updatedWorker =
          await response.json();

        // UPDATE STATE
        setWorker(updatedWorker);

        // UPDATE STORAGE
        await AsyncStorage.setItem(

          "workerProfile",

          JSON.stringify(updatedWorker)

        );

      } catch (err) {

        console.log(err);

      }

    };
  const logout =
    async () => {

      await AsyncStorage.removeItem(
        "token"
      );

      await AsyncStorage.removeItem(
        "user"
      );

      await AsyncStorage.removeItem(
        "workerProfile"
      );

      router.replace(
        "/login"
      );

    };

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>

        <Image

          source={{

            uri:

              worker?.image?.trim()

                ? worker.image.trim()

                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"

          }}

          style={styles.image}

        />

        <Text style={styles.name}>
          {worker?.name || "Worker"}
        </Text>

        <Text style={styles.phone}>
          {worker?.phone}
        </Text>

        <Text style={styles.email}>
          {worker?.email}
        </Text>

      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          router.push("/edit-worker-profile")
        }
      >
        <Ionicons
          name="create-outline"
          size={18}
          color="#fff"
        />
        <Text style={styles.editText}>
          Edit Profile
        </Text>
      </TouchableOpacity>

      {/* DETAILS */}
      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Worker Details
        </Text>

        <Text style={styles.label}>
          My Works
        </Text>

        {
          worker?.serviceTypes?.map(

            (item: any, index: number) => (

              <View

                key={index}

                style={styles.workCard}

              >

                <Text style={styles.workText}>
                  {item}
                </Text>

                <TouchableOpacity

                  onPress={async () => {

                    try {

                      const updatedServices =

                        worker.serviceTypes.filter(

                          (_: any, i: number) =>

                            i !== index

                        );

                      const response =
                        await fetch(

                          `${API_URL}/api/workers/update-works/${worker._id}`,

                          {

                            method: "PUT",

                            headers: {

                              "Content-Type":
                                "application/json"

                            },

                            body: JSON.stringify({

                              serviceTypes:
                                updatedServices

                            })

                          }

                        );

                      const data =
                        await response.json();

                      setWorker(data);

                      await AsyncStorage.setItem(

                        "workerProfile",

                        JSON.stringify(data)

                      );

                    } catch (err) {

                      console.log(err);

                    }

                  }}

                >

                  <Ionicons

                    name="trash-outline"

                    size={22}

                    color="#FF3B30"

                  />

                </TouchableOpacity>

              </View>

            )

          )
        }
        <Text style={styles.label}>
          Add Another Work
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

          )
        }
        <TouchableOpacity

          style={styles.addButton}

          onPress={async () => {

            try {

              if (

                !selectedCategory ||

                !selectedSubCategory

              ) {

                Alert.alert(
                  "Select work"
                );

                return;

              }

              const newWork =

                `${selectedCategory} - ${selectedSubCategory}`;

              // CHECK DUPLICATE
              if (

                worker?.serviceTypes?.includes(
                  newWork
                )

              ) {

                Alert.alert(
                  "Already added"
                );

                return;

              }

              const updatedServices = [

                ...(worker?.serviceTypes || []),

                newWork

              ];

              const response =
                await fetch(

                  `${API_URL}/api/workers/update-works/${worker._id}`,

                  {

                    method: "PUT",

                    headers: {

                      "Content-Type":
                        "application/json"

                    },

                    body: JSON.stringify({

                      serviceTypes:
                        updatedServices

                    })

                  }

                );

              const data =
                await response.json();

              setWorker(data);

              await AsyncStorage.setItem(

                "workerProfile",

                JSON.stringify(data)

              );

              setSelectedCategory("");

              setSelectedSubCategory("");

              Alert.alert(
                "Work Added"
              );

            } catch (err) {

              console.log(err);

            }

          }}

        >

          <Text style={styles.buttonText}>
            Add Work
          </Text>

        </TouchableOpacity>

        <Text style={styles.label}>
          Aadhar Card
        </Text>

        <Text style={styles.value}>
          {worker?.aadharCard}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12
          }}
        >

          <Text style={styles.label}>
            Work Location
          </Text>

          <TouchableOpacity

            onPress={() =>
              router.push(
                "/edit-location"
              )
            }

          >

            <Ionicons
              name="pencil"
              size={25}
              color="#8b3209"
            />

          </TouchableOpacity>

        </View>

        <Text style={styles.value}>
          {worker?.address || "No Location"}
        </Text>


      </View>

      {/* PAYMENT DETAILS */}
      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Payment Details
        </Text>

        <Text style={styles.label}>
          UPI ID
        </Text>

        <Text style={styles.value}>
          {worker?.upiId}
        </Text>

        <Text style={styles.label}>
          Bank Name
        </Text>

        <Text style={styles.value}>
          {worker?.bankName}
        </Text>

        <Text style={styles.label}>
          Account Number
        </Text>

        <Text style={styles.value}>
          {worker?.accountNumber}
        </Text>

        <Text style={styles.label}>
          IFSC Code
        </Text>

        <Text style={styles.value}>
          {worker?.ifsc}
        </Text>

      </View>

      {/* WALLET */}
      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>
          Wallet Balance
        </Text>

        <Text style={styles.walletAmount}>
          ₹{worker?.walletBalance || 0}
        </Text>
      </View>

      {/* EARNINGS */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push("/worker-earnings")
        }
      >
        <Text style={styles.buttonText}>
          Earnings
        </Text>
      </TouchableOpacity>

      {/* HISTORY */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push("/worker-history")
        }
      >
        <Text style={styles.buttonText}>
          Booking History
        </Text>
      </TouchableOpacity>

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() =>
          Alert.alert(
            "Logout",
            "Are you sure?",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              {
                text: "Logout",
                onPress: logout
              }
            ]
          )
        }
      >
        <Text style={styles.buttonText}>
          Logout
        </Text>
      </TouchableOpacity>

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F5F7"
  },

  profileCard: {
    backgroundColor: "#2962FF",
    paddingTop: 70,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35
  },

  image: {
    width: 130,
    height: 130,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#fff"
  },

  name: {
    marginTop: 18,
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff"
  },

  phone: {
    marginTop: 6,
    fontSize: 18,
    color: "#E3F2FD"
  },

  email: {
    marginTop: 4,
    fontSize: 16,
    color: "#E3F2FD"
  },

  card: {
    backgroundColor: "#fff",
    margin: 20,
    marginBottom: 0,
    borderRadius: 28,
    padding: 22
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },

  label: {
    marginTop: 12,
    fontSize: 15,
    color: "#666"
  },

  value: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "600",
    color: "#111"
  },

  walletCard: {
    backgroundColor: "#00C853",
    margin: 20,
    borderRadius: 28,
    padding: 28
  },

  walletLabel: {
    color: "#fff",
    fontSize: 18
  },

  walletAmount: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "bold",
    marginTop: 10
  },

  button: {
    backgroundColor: "#2962FF",
    marginHorizontal: 20,
    marginBottom: 15,
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center"
  },

  logoutButton: {
    backgroundColor: "#FF3B30",
    marginHorizontal: 20,
    marginBottom: 40,
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center"
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },
  workCard: {

    backgroundColor: "#fff",

    borderRadius: 22,

    padding: 18,

    marginBottom: 14,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 10,

    shadowOffset: {

      width: 0,

      height: 4

    },

    elevation: 5,

    borderWidth: 1,

    borderColor: "#F0F0F0"

  },

  workText: {

    fontSize: 17,

    fontWeight: "700",

    color: "#111",

    flex: 1

  },

  dropdown: {

    height: 60,

    backgroundColor: "#fff",

    borderRadius: 18,

    paddingHorizontal: 18,

    marginTop: 12,

    borderWidth: 1,

    borderColor: "#EAEAEA",

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 8,

    shadowOffset: {

      width: 0,

      height: 3

    },

    elevation: 3

  },

  addButton: {

    backgroundColor: "#2962FF",

    height: 56,

    borderRadius: 18,

    justifyContent: "center",

    alignItems: "center",

    marginTop: 18,

    marginBottom: 15,

    shadowColor: "#2962FF",

    shadowOpacity: 0.3,

    shadowRadius: 10,

    shadowOffset: {

      width: 0,

      height: 5

    },

    elevation: 5

  },
 editButton: {
  backgroundColor: "#2962FF",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginHorizontal: 20,
  marginTop: 15,
  paddingVertical: 14,
  borderRadius: 16
},

  editText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8
  },




});