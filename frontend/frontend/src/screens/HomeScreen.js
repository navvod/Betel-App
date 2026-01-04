import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Betel App</Text>
        <View style={styles.grid}>
          <FeatureCard title="Check Variety of betel leaves" onPress={() => navigation.navigate("VarietyCommercial", { screen: "VarietyScreen" })} />
          <FeatureCard title="Check Commercial type of betel leaves" onPress={() => navigation.navigate("VarietyCommercial", { screen: "CommercialScreen" })} />
          <FeatureCard title="Check quality of betel leaves" onPress={() => navigation.navigate("QualityPrice", { screen: "QualityScreen" })} />
          <FeatureCard title="Check disease type of betel leaves" onPress={() => navigation.navigate("Disease")} />
          <FeatureCard title="Check disease propagation level" onPress={() => navigation.navigate("Disease")} />
          <FeatureCard title="Price of betel leaves" onPress={() => navigation.navigate("QualityPrice", { screen: "PriceScreen" })} />
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
