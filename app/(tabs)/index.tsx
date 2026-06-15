import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Linking,
  Modal
} from "react-native";
import MapView, {
  Marker
} from "react-native-maps";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import Animated, {
  FadeInDown,
  FadeOutDown,
  ZoomIn,
  ZoomOut
} from "react-native-reanimated";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const socket =
  io(`${API_URL}`);
export default function HomeScreen() {
  const [location, setLocation] =
    useState<any>(null);
  const [selectedWorker, setSelectedWorker] =
    useState<any>(null);
  const [workers, setWorkers] =
    useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [search, setSearch] =
    useState("");
  // MULTIPLE BOOKINGS
  const [bookings, setBookings] =
    useState<any[]>([]);
  const [loading, setLoading] =
    useState(false);

  const [reviewModal, setReviewModal] =
    useState(false);

  const [allReviewsModal, setAllReviewsModal] =
    useState(false);

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState("");

  const [reviewWorker, setReviewWorker] =
    useState<any>(null);
    


  const saveUserNotification =
    async (
      title: string,
      message: string
    ) => {

      try {

        const existing =
          await AsyncStorage.getItem(
            "user_notifications"
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
          "user_notifications",
          JSON.stringify(
            notifications
          )
        );
        // SOUND
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true
        });

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

  const loadBookings =
    async () => {

      try {

        const savedUser =
          await AsyncStorage.getItem(
            "user"
          );

        if (!savedUser) return;

        const user =
          JSON.parse(savedUser);

        const response =
          await fetch(

            `${API_URL}/api/bookings/user/${user._id}`

          );

        const data =
          await response.json();

        setBookings(data);
        if (data.length > 0) {

          const latestBooking = data[0];

          const worker =
            workers.find(

              item =>

                item._id ===
                latestBooking.workerId

            );

          if (worker) {

            setSelectedWorker(worker);

          }

        }

      } catch (err) {

        console.log(err);

      }

    };

  useEffect(() => {

    loadBookings();
    (async () => {
      let { status } =
        await Location
          .requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let loc =
        await Location
          .getCurrentPositionAsync({});
      setLocation(loc.coords);
      try {
        const response = await fetch(
          `${API_URL}/api/workers`
        );

        const data =
          await response.json();

        setWorkers(data);

      } catch (error) {

        console.log(error);

      }

    })();

  }, []);



  // SOCKET EVENTS
  useEffect(() => {

    // BOOKING ACCEPTED
    socket.on(
      "bookingAccepted",
      async (updatedBooking) => {

        await saveUserNotification(

          "Booking Accepted",

          "Worker accepted your booking"

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

        await saveUserNotification(

          "Quotation Received",

          `Quotation ₹${updatedBooking.quoteAmount} received`

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

        await saveUserNotification(

          "Quote Approved",

          "Quotation approved successfully"

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

        await saveUserNotification(

          "Quote Rejected",

          "Quotation rejected"

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


    // WORKER ARRIVED
    socket.on(
      "workerArrived",
      async (updatedBooking) => {

        await saveUserNotification(

          "Worker Arrived",

          "Worker reached your location"

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

        await saveUserNotification(

          "Work Started",

          "Worker started the work"

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

        await saveUserNotification(

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


    // BOOKING CANCELLED
    socket.on(
      "bookingRejected",
      async (updatedBooking) => {

        await saveUserNotification(

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


    // PAYMENT DONE
    socket.on(
      "paymentDone",
      async (updatedBooking) => {

        await saveUserNotification(

          "Payment Successful",

          "Payment completed successfully"

        );

        setBookings(prev =>
          prev.map(item =>
            item._id === updatedBooking._id
              ? updatedBooking
              : item
          )
        );

        // CLOSE CARD
        setReviewWorker(updatedBooking);

        setReviewModal(true);

        setSelectedWorker(null);

      }
    );

    // LIVE WORKER UPDATE
    socket.on(
      "workerUpdated",
      (updatedWorker) => {

        setWorkers(prev => {

          const exists =
            prev.find(
              item =>
                item._id ===
                updatedWorker._id
            );

          // UPDATE EXISTING WORKER
          if (exists) {

            return prev.map(worker =>

              worker._id ===
                updatedWorker._id

                ? updatedWorker

                : worker

            );

          }

          // NEW WORKER
          return [
            updatedWorker,
            ...prev
          ];

        });

      }
    );
    // LIVE LOCATION UPDATE
    socket.on(
      "workerLocationUpdated",
      (data) => {

        setWorkers(prev =>

          prev.map(worker =>

            worker._id ===
              data.workerId

              ? {

                ...worker,

                location: {
                  coordinates: [
                    data.longitude,
                    data.latitude
                  ]
                }

              }

              : worker

          )

        );

      }
    );
    socket.on(
      "workerCreated",
      (newWorker) => {

        setWorkers(prev => {

          const exists =
            prev.find(
              item =>
                item._id ===
                newWorker._id
            );

          if (exists) {
            return prev;
          }

          return [
            newWorker,
            ...prev
          ];

        });

      }
    );
    socket.on(
      "workerDeleted",
      (workerId) => {

        setWorkers(prev =>

          prev.filter(
            item =>
              item._id !== workerId
          )

        );

      }
    );

    return () => {

      socket.off("bookingAccepted");

      socket.off("workerArrived");

      socket.off("workStarted");

      socket.off("workCompleted");

      socket.off("bookingRejected");

      socket.off("workerUpdated");

      socket.off("workerCreated");

      socket.off("workerDeleted");

      socket.off(
        "workerLocationUpdated"
      );

    };

  }, []);

  useEffect(() => {

    if (

      bookings.length > 0 &&

      workers.length > 0

    ) {

      const pendingBooking =

        bookings.find(

          item =>

            item.paymentStatus !== "paid"

        );

      if (pendingBooking) {

        const worker =

          workers.find(

            item =>

              item._id ===
              pendingBooking.workerId

          );

        if (worker) {

          setSelectedWorker(worker);

        }

      }

    }

  }, [bookings, workers]);

  const submitReview =
    async () => {

      try {

        await fetch(

          `${API_URL}/api/workers/review/${reviewWorker.workerId}`,

          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              userName: "User",

              rating,

              comment

            })

          }

        );

        setReviewModal(false);

        setComment("");

        setRating(5);

      } catch (err) {

        console.log(err);

      }

    };


  if (!location) return null;

  const filteredWorkers =
    workers.filter(worker => {

      if (!worker.isOnline) {
        return false;
      }

      const workerSkills =
        worker.serviceTypes || [];

      const categoryMatch =
        selectedCategory === "All"
          ? true
          : workerSkills.some(
            (skill: string) =>
              skill
                ?.toLowerCase()
                .includes(
                  selectedCategory
                    ?.toLowerCase()
                )
          );

      const searchMatch =
        workerSkills.some(
          (skill: string) =>
            skill
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              )
        );

      return (
        categoryMatch &&
        searchMatch
      );

    });
  const categories = [
    { name: "All", icon: "🏠" },
    { name: "Painter", icon: "🎨" },
    { name: "Plumber", icon: "🚿" },
    { name: "Carpenter", icon: "🔨" },
    { name: "Electrician", icon: "⚡" },
    { name: "Driver", icon: "🚗" },
    { name: "Teacher", icon: "📚" },
    { name: "Cook", icon: "👨‍🍳" },
    { name: "Cleaner", icon: "🧹" },
    { name: "Mechanic", icon: "🔧" },
    { name: "AC Repair", icon: "❄️" }
  ];


  return (

    <View style={styles.container}>
      <View style={styles.topContainer}>

        {/* SEARCH BAR */}
        <TextInput
          placeholder="Search technician..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#777"
        />

        {/* CATEGORY SCROLL */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 15
          }}
        >
          {categories.map((item) => {

            const selected =
              selectedCategory === item.name;

            return (

              <TouchableOpacity
                key={item.name}
                style={[
                  styles.categoryButton,
                  selected &&
                  styles.categoryButtonActive
                ]}
                onPress={() =>
                  setSelectedCategory(item.name)
                }
              >

                <Text
                  style={{
                    fontSize: 20,
                    marginRight: 8
                  }}
                >
                  {item.icon}
                </Text>

                <Text
                  style={[
                    styles.categoryText,
                    selected &&
                    styles.categoryTextActive
                  ]}
                >
                  {item.name}
                </Text>

              </TouchableOpacity>

            );

          })}
        </ScrollView>

      </View>
      <Text style={styles.availableText}>

        Available:
        {" "}
        {filteredWorkers.length}
        {" "}
        workers

      </Text>

      <MapView
        style={styles.map}
        showsUserLocation={true}
        onPress={() => {

          setSelectedWorker(null);

        }}

        initialRegion={{
          latitude:
            location.latitude,

          longitude:
            location.longitude,

          latitudeDelta: 0.2,
          longitudeDelta: 0.2
        }}
      >

        {filteredWorkers.map((worker) => (

          <Marker
            key={worker._id}

            coordinate={{

              latitude:

                worker?.location
                  ?.coordinates?.[1] || 17.3850,

              longitude:

                worker?.location
                  ?.coordinates?.[0] || 78.4867

            }}

            onPress={() =>
              setSelectedWorker(worker)
            }
          >

            <View style={styles.markerContainer}>

              <Image

                source={{

                  uri:

                    worker?.image?.trim()

                      ? worker.image.trim()

                      : "https://i.pravatar.cc/150?img=10"

                }}

                style={styles.workerImage}

                resizeMode="cover"

              />

            </View>

          </Marker>

        ))}

      </MapView>
      <ScrollView
        style={styles.bookingContainer}
      >

        {bookings
          .filter(
            item =>
              item.paymentStatus !== "paid"
          )
          .map((item) => {

            const worker =
              workers.find(

                w =>
                  w._id === item.workerId

              );

            if (!worker) return null;

            return (

              <TouchableOpacity

                key={item._id}

                style={styles.bookingCard}

                onPress={() =>
                  setSelectedWorker(worker)
                }
              >

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center"
                  }}
                >

                  <Image

                    source={{

                      uri:

                        worker?.image?.trim()

                          ? worker.image.trim()

                          : "https://i.pravatar.cc/150?img=10"

                    }}

                    style={styles.bookingImage}

                  />

                  <View
                    style={{
                      marginLeft: 12
                    }}
                  >

                    <Text style={styles.bookingName}>
                      {worker.name}
                    </Text>

                    <Text style={styles.bookingStatus}>
                      Status:
                      {" "}
                      {item.status}
                    </Text>

                  </View>

                </View>

              </TouchableOpacity>

            );

          })}

      </ScrollView>


      {/* WORKER CARD */}
      {selectedWorker && (() => {

        const currentBooking =

          bookings.find(

            item =>

              item.workerId ===
              selectedWorker._id

              &&

              item.paymentStatus !== "paid"

          );

        return (

          <Animated.View
            entering={FadeInDown.duration(350)}
            exiting={FadeOutDown.duration(250)}
            style={styles.card}
          >

            <ScrollView
              showsVerticalScrollIndicator={false}
            >

              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 15
                }}
              >

                <Image
                  source={{
                    uri:
                      selectedWorker?.image?.trim()
                        ? selectedWorker.image
                        : "https://i.pravatar.cc/150"
                  }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 20
                  }}
                />

                <View
                  style={{
                    flex: 1,
                    marginLeft: 15
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      marginBottom: 5
                    }}
                  >
                    {selectedCategory}
                  </Text>

                  {selectedCategory === "All" ? (

                    selectedWorker.serviceTypes?.map(
                      (service, index) => (
                        <Text
                          key={index}
                          style={styles.name}
                        >
                          {service}
                        </Text>
                      )
                    )

                  ) : (

                    selectedWorker.serviceTypes
                      ?.filter(service =>
                        service
                          ?.toLowerCase()
                          .startsWith(
                            selectedCategory.toLowerCase()
                          )
                      )
                      .map((service, index) => (
                        <Text
                          key={index}
                          style={styles.name}
                        >
                          {service}
                        </Text>
                      ))

                  )}

                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 12,
                      alignItems: "center"
                    }}
                  >
                    <Text
                      style={{
                        color: "#F59E0B",
                        fontWeight: "700",
                        fontSize: 15
                      }}
                    >
                      ⭐ {selectedWorker?.rating}
                    </Text>

                    <Text
                      style={{
                        marginLeft: 12,
                        color: "#6B7280"
                      }}
                    >
                      {selectedWorker?.totalReviews} Reviews
                    </Text>

                    <Text
                      style={{
                        marginLeft: 12,
                        color: "#6B7280"
                      }}
                    >
                      {selectedWorker?.totalJobs} Jobs
                    </Text>
                  </View>

                </View>

              </View>
              {/* SMALL REVIEW */}
              {

                selectedWorker?.reviews?.length > 0 && (

                  <View style={styles.smallReviewCard}>

                    <View style={styles.reviewTopRow}>

                      <Text style={styles.reviewUser}>

                        {
                          selectedWorker
                            ?.reviews?.[
                            selectedWorker?.reviews.length - 1
                          ]
                            ?.userName
                        }

                      </Text>

                      <Text style={styles.reviewStars}>

                        ⭐ {
                          selectedWorker
                            ?.reviews?.[
                            selectedWorker?.reviews.length - 1
                          ]
                            ?.rating
                        }

                      </Text>

                    </View>

                    <Text style={styles.reviewComment}>

                      {
                        selectedWorker
                          ?.reviews?.[
                          selectedWorker?.reviews.length - 1
                        ]
                          ?.comment
                      }

                    </Text>

                    <TouchableOpacity

                      onPress={() =>
                        setAllReviewsModal(true)
                      }

                    >

                      <Text style={styles.seeAllText}>
                        See all reviews →
                      </Text>

                    </TouchableOpacity>

                  </View>

                )

              }

              {/* CONTACT BUTTON */}
              {(!currentBooking ||
                currentBooking.status === "cancelled") && (

                  <TouchableOpacity

                    disabled={loading}

                    activeOpacity={0.8}

                    style={[
                      styles.button,
                      loading && {
                        opacity: 0.5
                      }
                    ]}

                    onPress={async () => {

                      try {

                        setLoading(true);

                        const savedUser =
                          await AsyncStorage.getItem(
                            "user"
                          );

                        if (!savedUser) return;

                        const user =
                          JSON.parse(savedUser);

                        const response =
                          await fetch(
                            `${API_URL}/api/bookings`,
                            {
                              method: "POST",

                              headers: {
                                "Content-Type":
                                  "application/json"
                              },

                              body: JSON.stringify({

                                userId: user._id,

                                workerId:
                                  selectedWorker._id,

                                serviceType:
                                  selectedCategory,

                                status: "pending",

                                location: {

                                  lat:
                                    location.latitude,

                                  lng:
                                    location.longitude

                                }

                              })

                            }
                          );

                        const data =
                          await response.json();

                        setBookings(prev => [
                          data,
                          ...prev
                        ]);

                      } catch (err) {

                        console.log(err);

                      } finally {

                        setLoading(false);

                      }

                    }}
                  >

                    <Text style={styles.buttonText}>

                      {loading
                        ? "Booking..."
                        : "Contact Worker"}

                    </Text>

                  </TouchableOpacity>

                )}


              {/* PENDING */}
              {/* PENDING / ACCEPTED / ARRIVED / STARTED */}
              {currentBooking && (

                <View>

                  <Text style={styles.statusText}>

                    Booking Status:
                    {" "}
                    {currentBooking.status}

                  </Text>
                  {currentBooking.status === "quoted" && (

                    <View style={styles.quoteBox}>

                      <Text style={styles.quoteTitle}>
                        Inspection Quote
                      </Text>

                      <Text style={styles.quoteAmount}>
                        ₹ {currentBooking.quoteAmount}
                      </Text>

                      <Text style={styles.quoteDescription}>
                        {currentBooking.quoteDescription}
                      </Text>

                      <View style={styles.actionRow}>

                        {/* APPROVE */}
                        <TouchableOpacity

                          style={styles.callButton}

                          onPress={async () => {

                            try {

                              await fetch(
                                `${API_URL}/api/bookings/approve-quote/${currentBooking._id}`,
                                {
                                  method: "POST"
                                }
                              );

                            } catch (err) {

                              console.log(err);

                            }

                          }}
                        >

                          <Text style={styles.actionText}>
                            Approve
                          </Text>

                        </TouchableOpacity>


                        {/* REJECT */}
                        <TouchableOpacity

                          style={styles.cancelButton}

                          onPress={async () => {

                            try {

                              await fetch(
                                `${API_URL}/api/bookings/reject-quote/${currentBooking._id}`,
                                {
                                  method: "POST"
                                }
                              );

                            } catch (err) {

                              console.log(err);

                            }

                          }}
                        >

                          <Text style={styles.actionText}>
                            Reject
                          </Text>

                        </TouchableOpacity>

                      </View>

                    </View>

                  )}

                  <View style={styles.actionRow}>

                    {/* CALL WORKER */}
                    <TouchableOpacity

                      style={styles.callButton}

                      onPress={() => {

                        Linking.openURL(
                          `tel:${selectedWorker.phone || "9876543210"}`
                        );

                      }}
                    >

                      <Text style={styles.actionText}>
                        Call Worker
                      </Text>

                    </TouchableOpacity>


                    {/* CANCEL WORK */}
                    <TouchableOpacity

                      style={[

                        styles.cancelButton,

                        (
                          currentBooking.status === "started" ||
                          currentBooking.status === "completed"
                        ) && {
                          opacity: 0.5
                        }

                      ]}

                      disabled={
                        currentBooking.status === "started" ||
                        currentBooking.status === "completed"
                      }

                      onPress={async () => {

                        try {

                          await fetch(
                            `${API_URL}/api/bookings/reject/${currentBooking._id}`,
                            {
                              method: "POST"
                            }
                          );

                          setBookings(prev =>
                            prev.filter(
                              item =>
                                item._id !==
                                currentBooking._id
                            )
                          );

                        } catch (err) {

                          console.log(err);

                        }

                      }}
                    >

                      <Text style={styles.actionText}>
                        {
                          currentBooking.status === "started"
                            ? "Work Started"
                            : currentBooking.status === "completed"
                              ? "Completed"
                              : "Cancel Work"
                        }
                      </Text>

                    </TouchableOpacity>

                  </View>

                </View>

              )
              }


              {/* CANCELLED STATUS */}
              {currentBooking &&
                currentBooking.status === "cancelled" && (

                  <View>

                    <Text
                      style={[
                        styles.statusText,
                        {
                          backgroundColor: "#FDECEC",
                          color: "#ff3b30"
                        }
                      ]}
                    >

                      Booking Cancelled

                    </Text>

                  </View>

                )}
              {/* COMPLETED */}
              {currentBooking?.status === "completed" && (

                <View style={styles.completedBox}>

                  <Text style={styles.completedText}>
                    Work Completed ✅
                  </Text>

                  <Text style={styles.paymentInfoText}>
                    Worker will collect payment
                  </Text>

                  <Text style={styles.amountText}>
                    ₹{currentBooking?.quoteAmount}
                  </Text>

                </View>

              )}

              {/* PAYMENT DONE */}
              {currentBooking?.paymentStatus === "paid" && (

                <View style={styles.completedBox}>

                  <Text style={styles.completedText}>
                    Payment Successful ✅
                  </Text>

                </View>

              )}

            </ScrollView>
          </Animated.View>

        );

      })()}
      <Modal
        visible={reviewModal}
        transparent
        animationType="slide"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.reviewModal}>

            <Text style={styles.reviewTitle}>
              Rate Worker
            </Text>

            <View style={styles.starRow}>

              {[1, 2, 3, 4, 5].map((item) => (

                <TouchableOpacity
                  key={item}
                  onPress={() =>
                    setRating(item)
                  }
                >

                  <Text style={{
                    fontSize: 35
                  }}>

                    {item <= rating
                      ? "⭐"
                      : "☆"}

                  </Text>

                </TouchableOpacity>

              ))}

            </View>

            <TextInput
              placeholder="Write review..."
              value={comment}
              onChangeText={setComment}
              multiline
              style={styles.reviewInput}
            />

            <TouchableOpacity

              style={styles.submitReviewButton}

              onPress={submitReview}

            >

              <Text style={styles.buttonText}>
                Submit Review
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>
      <Modal
        visible={allReviewsModal}
        transparent
        animationType="slide"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.allReviewsModal}>

            <View style={styles.reviewHeader}>

              <Text style={styles.allReviewsTitle}>
                All Reviews
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setAllReviewsModal(false)
                }
              >

                <Text style={styles.closeText}>
                  ✕
                </Text>

              </TouchableOpacity>

            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
            >

              {

                selectedWorker?.reviews
                  ?.slice()
                  ?.reverse()
                  ?.map((item: any, index: number) => (

                    <View
                      key={index}
                      style={styles.fullReviewCard}
                    >

                      <View style={styles.reviewTopRow}>

                        <Text style={styles.reviewUser}>
                          {item.userName}
                        </Text>

                        <Text style={styles.reviewStars}>
                          ⭐ {item.rating}
                        </Text>

                      </View>

                      <Text style={styles.reviewComment}>
                        {item.comment}
                      </Text>

                    </View>

                  ))

              }

            </ScrollView>

          </View>

        </View>

      </Modal>

    </View >

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1
  },

  map: {
    flex: 1
  },
  markerContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 5
  },
  workerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 26

  },

  card: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,

    paddingHorizontal: 20,
    paddingTop: 20,

    maxHeight: "65%",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4
  },

  rating: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "600"
  },

  jobs: {
    fontSize: 16,
    marginTop: 5,
    color: "gray"
  },

  button: {
    backgroundColor: "#2563EB",
    marginTop: 20,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700"
  },

  statusText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#00C853",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 10,
    textAlign: "center"
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between"
  },

  callButton: {
    flex: 1,
    backgroundColor: "#00C853",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 10
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#ff3b30",
    padding: 14,
    borderRadius: 12,
    alignItems: "center"
  },

  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
  topContainer: {
    position: "absolute",
    top: 60,
    zIndex: 999,
    width: "100%"
  },

  searchInput: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
    elevation: 5
  },

  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 20,
    height: 50,

    borderRadius: 28,

    marginRight: 14,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 8,

    borderWidth: 1,
    borderColor: "#F1F5F9",

    minWidth: 130
  },

  categoryText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B"
  },
  categoryButtonActive: {
    backgroundColor: "#2563EB",

    borderColor: "#2563EB",

    shadowColor: "#2563EB",
    shadowOpacity: 0.35,
    shadowRadius: 15
  },
  categoryTextActive: {
    color: "#FFFFFF"
  },


  availableText: {
    position: "absolute",
    top: 180,
    left: 15,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    elevation: 5,
    zIndex: 999
  },
  quoteBox: {
    backgroundColor: "#F5F7FF",
    marginTop: 20,
    padding: 20,
    borderRadius: 18
  },

  quoteTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },

  quoteAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2962FF"
  },

  quoteDescription: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
    lineHeight: 24
  },
  payButton: {
    backgroundColor: "#2962FF",
    marginTop: 20,
    padding: 18,
    borderRadius: 14,
    alignItems: "center"
  },

  completedBox: {
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center"
  },
  completedText: {
    color: "#00C853",
    fontWeight: "bold",
    fontSize: 18
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },

  reviewModal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 25
  },

  reviewTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center"
  },

  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20
  },

  reviewInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    height: 120,
    padding: 15,
    textAlignVertical: "top"
  },

  submitReviewButton: {
    backgroundColor: "#2962FF",
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    alignItems: "center"
  },
  reviewCount: {
    marginTop: 5,
    fontSize: 15,
    color: "#666"
  },

  reviewSection: {
    marginTop: 15
  },

  reviewCard: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10
  },

  smallReviewCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  reviewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  reviewUser: {
    fontWeight: "bold",
    fontSize: 15
  },

  reviewStars: {
    color: "#FFA000",
    fontWeight: "bold"
  },

  reviewComment: {
    marginTop: 8,
    color: "#555",
    lineHeight: 20
  },

  seeAllText: {
    marginTop: 10,
    color: "#2962FF",
    fontWeight: "bold"
  },
  allReviewsModal: {
    width: "92%",
    height: "75%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },

  allReviewsTitle: {
    fontSize: 24,
    fontWeight: "bold"
  },

  closeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#666"
  },

  fullReviewCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  paymentInfoText: {
    marginTop: 8,
    color: "#555",
    fontSize: 15
  },

  amountText: {
    marginTop: 10,
    fontSize: 32,
    fontWeight: "bold",
    color: "#111"
  },
  bookingContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    maxHeight: 220
  },
  bookingCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 18,
    padding: 15,
    elevation: 6
  },
  bookingImage: {
    width: 55,
    height: 55,
    borderRadius: 100
  },
  bookingName: {
    fontSize: 18,
    fontWeight: "bold"
  },
  bookingStatus: {
    marginTop: 5,
    color: "#666"
  },

});