import React, { useRef, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Animated, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommercialResultScreen({ route, navigation }) {
  const { image, type, confidence } = route.params || {};

  // Convert confidence to percentage
  const confidencePercent = (confidence * 100).toFixed(1);

  // Animated value for progress
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: confidence,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, []);

  // Commercial Type Color Logic (Optional: Customize colors per type if needed)
  const getTypeColor = () => {
    // Example colors for different types, can be adjusted
    if (type?.includes("Kanda")) return "#27AE60"; // Green
    if (type?.includes("Keti")) return "#2980B9"; // Blue
    if (type?.includes("Korikan")) return "#D35400"; // Orange
    if (type?.includes("Peedunu")) return "#8E44AD"; // Purple
    return "#16A085"; // Default Teal
  };

  // Animated width
  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Share Report
  const shareReport = async () => {
    const report = `
🌿 Betel Leaf Commercial Type Report

Commercial Type : ${type}
Confidence      : ${confidencePercent}%
`;
    await Share.share({ message: report });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Image Display */}
      <Image source={{ uri: image }} style={styles.image} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Result Card */}
        <View style={styles.card}>
          
          {/* Type Badge */}
          <View style={[styles.typeBox, { backgroundColor: getTypeColor() + "20" }]}>
            <Text style={[styles.typeLabel, { color: getTypeColor() }]}>Detected Commercial Type</Text>
            <Text style={[styles.typeName, { color: getTypeColor() }]}>{type}</Text>
          </View>

          {/* Confidence Section */}
          <Text style={styles.label}>Confidence Level</Text>
          <Text style={[styles.percent, { color: getTypeColor() }]}>{confidencePercent}%</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: animatedWidth,
                  backgroundColor: getTypeColor(),
                },
              ]}
            />
          </View>

          {/* Share Report Button */}
          <TouchableOpacity style={styles.shareBtn} onPress={shareReport}>
            <Ionicons name="share-social-outline" size={20} color="#145A32" />
            <Text style={styles.shareText}>Share Report</Text>
          </TouchableOpacity>

          {/* Scan Again Button */}
          <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="scan" size={22} color="#fff" />
            <Text style={styles.scanText}>Scan Again</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f3d2e",
  },
  image: {
    width: "100%",
    height: 300,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 22,
    padding: 24,
    elevation: 5,
    marginTop: -30, // Overlap effect
  },
  typeBox: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  typeName: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 6,
    fontWeight: "600",
  },
  percent: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "#ECF0F1",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 24,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9F7EF",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#145A32",
  },
  shareText: {
    marginLeft: 8,
    color: "#145A32",
    fontWeight: "700",
    fontSize: 16,
  },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#145A32",
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
  },
  scanText: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});