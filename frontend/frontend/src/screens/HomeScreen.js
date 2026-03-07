import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

export default function HomeScreen({ navigation }) {
  const [recent, setRecent] = useState([]);

  const speak = (text) => {
    Speech.speak(text, {
      language: "si-LK",
    });
  };

  const voiceTexts = {
    "Variety Type": "ඔබේ බුලත් කොළ වර්ගය පිලිබඳ තොරතුරු",
    "Commercial Type": "ඔබේ බුලත් කොලයේ වාණිජ තත්වය පිලිබඳ තොරතුරු",
    "Quality": "ඔබේ බුලත් කොලයේ තත්වය පිලිබඳ තොරතුරු",
    "Disease": "ඔබේ වගාවට සෑදී ඇති ලෙඩ රෝගය පිලිබඳ තොරතුරු",
    "Propagation": "ඔබේ වගාවට සෑදී ඇති ලෙඩ රෝගයේ තත්වය පිලිබඳ තොරතුරු",
    "Price": "ඔබේ බුලත් කොලයේ අගය පිලිබඳ තොරතුරු",
  };

  const features = [
    { title: "Variety Type", route: "VarietyCommercial", params: { screen: "VarietyScreen" }, icon: "leaf", type: "MaterialCommunityIcons" },
    { title: "Commercial Type", route: "VarietyCommercial", params: { screen: "CommercialScreen" }, icon: "briefcase", type: "Ionicons" },
    { title: "Quality", route: "QualityPrice", params: { screen: "QualityScreen" }, icon: "checkmark-circle", type: "Ionicons" },
    { title: "Disease", route: "Disease", icon: "bug", type: "Ionicons" },
    { title: "Propagation", route: "Disease", icon: "water", type: "Ionicons" },
    { title: "Price", route: "QualityPrice", params: { screen: "PriceScreen" }, icon: "pricetag", type: "Ionicons" },
  ];

  const handlePress = (item) => {
    if (item.params) {
      navigation.navigate(item.route, item.params);
    } else {
      navigation.navigate(item.route);
    }
    const filtered = recent.filter((r) => r.title !== item.title);
    setRecent([item, ...filtered].slice(0, 4));
  };

  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.welcome}>Welcome !</Text>
          </View>

        <View style={styles.grid}>
          {features.map((f) => (
            <TouchableOpacity key={f.title} style={styles.card} onPress={() => handlePress(f)}>
                <TouchableOpacity
                  style={styles.voiceBtn}
                  onPress={() => speak(voiceTexts[f.title])}
                >
                  <Ionicons name="volume-high" size={20} color="#fff" />
                </TouchableOpacity>
                {f.type === "MaterialCommunityIcons" ? (
                  <MaterialCommunityIcons name={f.icon} size={32} color="#145a32" style={styles.icon} />
                ) : (
                  <Ionicons name={f.icon} size={32} color="#145a32" style={styles.icon} />
                )}
                <Text style={styles.cardTitle}>{f.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent activities</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentList}>
            {recent.map((r) => (
              <TouchableOpacity key={r.title} style={styles.recentCard} onPress={() => handlePress(r)}>
                 {r.type === "MaterialCommunityIcons" ? (
                  <MaterialCommunityIcons name={r.icon} size={24} color="#145a32" style={styles.icon} />
                ) : (
                  <Ionicons name={r.icon} size={24} color="#145a32" style={styles.icon} />
                )}
                <Text style={styles.recentCardTitle}>{r.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  header: { marginBottom: 8 },
  welcome: { fontSize: 35, fontWeight: "bold", color: "#eafaf1" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 8, marginBottom: -100 },
  card: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: "#eafaf1",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#9be7a6",
  },
  voiceBtn: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#145a32",
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },
  icon: { marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#145a32", textAlign: "center" },
  recentHeader: { marginTop: 8, marginBottom: 6, alignItems: "flex-start" },
  recentTitle: { fontSize: 24, fontWeight: "800", color: "#eafaf1" },
  recentList: { gap: 10 },
  recentCard: {
    width: 110,
    height: 110,
    backgroundColor: "#c8f7dc",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#9be7a6",
  },
  recentCardTitle: { fontSize: 18, fontWeight: "800", color: "#145a32", textAlign: "center", paddingHorizontal: 8 },
});
