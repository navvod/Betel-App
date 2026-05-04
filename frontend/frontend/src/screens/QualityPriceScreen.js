import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function QualityPriceScreen({ navigation }) {
  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Quality & Price</Text>
          </View>

          <View style={styles.grid}>
            <FeatureCard 
              title="Check Quality" 
              icon="checkmark-circle-outline" 
              onPress={() => navigation.navigate("QualityScreen")} 
            />
            <FeatureCard 
              title="Check Price" 
              icon="pricetag-outline" 
              onPress={() => navigation.navigate("PriceScreen")} 
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FeatureCard({ title, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name={icon} size={42} color="#145a32" style={styles.icon} />
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 25 },
  header: { marginBottom: 30, alignItems: "center" },
  title: { fontSize: 38, fontWeight: "bold", color: "#eafaf1" },
  grid: { flex: 1, justifyContent: "center", gap: 30, paddingBottom: 60 },
  card: {
    backgroundColor: "#eafaf1",
    borderRadius: 16,
    padding: 10,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: "#c8f7dc",
    borderLeftColor: "#c8f7dc",
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderBottomColor: "#0a2d1e",
    borderRightColor: "#0a2d1e",
    elevation: 10,
    shadowColor: "#0a2d1e",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 6,
  },
  icon: { marginBottom: 12 },
  cardTitle: { fontSize: 23, fontWeight: "800", color: "#145a32", textAlign: "center" },
});
