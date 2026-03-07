import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="leaf" size={60} color="#9be7a6" />
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  loader: {
    marginVertical: 20,
  },
  message: {
    fontSize: 18,
    color: "#eafaf1",
    fontWeight: "600",
  },
});
