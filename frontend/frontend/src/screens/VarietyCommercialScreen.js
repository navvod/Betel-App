import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function VarietyCommercialScreen({ navigation }) {
  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Variety & Commercial</Text>
          </View>
          <View style={styles.grid}>
            <FeatureCard
              title="Check Variety"
              icon="leaf-outline"
              onPress={() => navigation.navigate("VarietyScreen")}
            />
            <FeatureCard
              title="Check Commercial Type"
              icon="albums-outline"
              onPress={() => navigation.navigate("CommercialScreen")}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FeatureCard({ title, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={icon} size={40} color="#145a32" style={styles.icon} />
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 25 },
  header: { marginBottom: 30, alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", color: "#eafaf1" },
  grid: { flex: 1, justifyContent: "center", gap: 30, paddingBottom: 60 },
  card: {
    backgroundColor: "#eafaf1",
    borderRadius: 24,
    paddingVertical: 50,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    borderWidth: 1,
    borderColor: "#9be7a6",
    flexDirection: "row",
    gap: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  icon: { marginBottom: 0 },
  cardTitle: { fontSize: 24, fontWeight: "800", color: "#145a32" },
});
