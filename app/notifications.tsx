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

export default function Notifications() {

  const [notifications, setNotifications] =
    useState<any[]>([]);

  useEffect(() => {

    const markAsRead =
      async () => {

        const saved =
          await AsyncStorage.getItem(
            "notifications"
          );

        const notifications =
          saved
            ? JSON.parse(saved)
            : [];

        await AsyncStorage.setItem(

          "notification_read_count",

          notifications.length.toString()

        );

      };

    markAsRead();

    loadNotifications();

    const interval =
      setInterval(() => {

        loadNotifications();

      }, 1000);

    return () =>
      clearInterval(interval);

  }, []);

  const loadNotifications =
    async () => {

      try {

        const saved =
          await AsyncStorage.getItem(
            "notifications"
          );

        if (saved) {

          setNotifications(
            JSON.parse(saved)
          );

        } else {

          setNotifications([]);

        }

      } catch (err) {

        console.log(err);

      }

    };

  return (

    <View style={styles.container}>

      <Text style={styles.heading}>
        Notifications
      </Text>

      <FlatList

        data={[...notifications].reverse()}

        keyExtractor={(_, index) =>
          index.toString()
        }

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
              No notifications yet
            </Text>

          </View>

        }

        renderItem={({ item }) => (

          <View style={styles.card}>

            <Text style={styles.title}>
              {item.title}
            </Text>

            <Text style={styles.message}>
              {item.message}
            </Text>

            <Text style={styles.time}>
              {item.time}
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
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20
  },

  card: {
    backgroundColor: "#F5F5F5",
    padding: 18,
    borderRadius: 18,
    marginBottom: 15
  },

  title: {
    fontSize: 18,
    fontWeight: "bold"
  },

  message: {
    marginTop: 6,
    color: "#555"
  },

  time: {
    marginTop: 10,
    color: "#999",
    fontSize: 12
  }

});