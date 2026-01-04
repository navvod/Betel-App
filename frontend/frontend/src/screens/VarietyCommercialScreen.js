import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VarietyCommercialScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Variety & Commercial</Text>
        <View style={styles.grid}>
          <FeatureCard title="Check Variety of betel leaves" onPress={() => navigation.navigate("VarietyScreen")} />
          <FeatureCard title="Check Commercial type of betel leaves" onPress={() => navigation.navigate("CommercialScreen")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureCard({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9f9" },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#145a32", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { width: "48%", backgroundColor: "#ffffff", borderRadius: 12, padding: 14, marginBottom: 12, elevation: 3 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#1e8449" },
});
