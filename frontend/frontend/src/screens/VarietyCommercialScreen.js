import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function VarietyCommercialScreen({ navigation }) {
  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
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
        </ScrollView>
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
  content: { padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 35, fontWeight: "bold", color: "#eafaf1" },
  grid: { gap: 20 },
  card: {
    backgroundColor: "#eafaf1",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    borderWidth: 1,
    borderColor: "#9be7a6",
    flexDirection: "row",
    gap: 15,
  },
  icon: { marginBottom: 0 },
  cardTitle: { fontSize: 24, fontWeight: "800", color: "#145a32" },
});
