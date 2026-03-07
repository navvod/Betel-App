import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.text}>Farmer, Trader, Exporter</Text>
      </View>

      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => navigation.navigate("History")}
      >
        <Ionicons name="time-outline" size={24} color="#fff" />
        <Text style={styles.historyBtnText}>Disease Checking History</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9f9" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, elevation: 3, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold", color: "#145a32", marginBottom: 8 },
  text: { fontSize: 14, color: "#145a32" },
  historyBtn: {
    flexDirection: "row",
    backgroundColor: "#145a32",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  historyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
