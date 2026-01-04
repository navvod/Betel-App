import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QualityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Quality Check</Text>
        <Text style={styles.text}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9f9" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, elevation: 3 },
  title: { fontSize: 20, fontWeight: "bold", color: "#145a32", marginBottom: 8 },
  text: { fontSize: 14, color: "#145a32" },
});
