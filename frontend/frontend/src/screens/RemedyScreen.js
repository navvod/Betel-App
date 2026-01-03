import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RemedyScreen({ route }) {
  const {
    image,
    severityLevel = "unknown",
    remedy = {},
  } = route.params || {};

  const SEVERITY = severityLevel.toUpperCase();

  // 🎨 Risk color
  const getWarningColor = (level) => {
    if (level === "LOW") return "#2ECC71";
    if (level === "MEDIUM") return "#F1C40F";
    if (level === "HIGH") return "#E74C3C";
    return "#95A5A6";
  };
  const getSeverityColor = (level) => {
  if (level === "EARLY") return "#2ECC71";     // green
  if (level === "MODERATE") return "#F1C40F";  // yellow
  if (level === "SEVERE") return "#E74C3C";    // red
  return "#7F8C8D";
  };
  // 📤 Share (FIXED)
  const shareRemedy = async () => {
    const report = `
🌿 Betel Leaf Treatment Guide

Severity : ${SEVERITY}
Risk Level: ${remedy?.warning_level || "UNKNOWN"}

Cultural Practices:
- ${remedy?.cultural?.join("\n- ") || "N/A"}

Scientific Control:
- ${remedy?.scientific?.join("\n- ") || "N/A"}

Prevention:
- ${remedy?.prevention?.join("\n- ") || "N/A"}
    `;
    await Share.share({ message: report });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.card}>
          <Text style={styles.title}>Treatment & Remedies</Text>

          {/* 🔴 Severity line (same line, bold) */}
        <View style={styles.row}>
            <Text style={styles.sectionInline}>Severity: </Text>
            <Text
                style={[
                styles.severityText,
                { color: getSeverityColor(SEVERITY) }
                ]}
            >
                {SEVERITY}
            </Text>
        </View>

          {/* 🟢 Risk Badge */}
          <Text style={styles.section}>Risk Level</Text>
          <View
            style={[
              styles.warningBadge,
              { backgroundColor: getWarningColor(remedy?.warning_level) },
            ]}
          >
            <Text style={styles.warningText}>
              {remedy?.warning_level || "UNKNOWN"}
            </Text>
          </View>

          {/* 🌱 Cultural */}
          <Text style={[styles.section, { color: "#27AE60" }]}>🌱 Cultural Practices</Text>
          {remedy?.cultural?.map((i, idx) => (
            <Text key={idx} style={styles.text}>• {i}</Text>
          ))}

          {/* 🧪 Scientific */}
          <Text style={[styles.section, { color: "#2980B9" }]}>🧪 Scientific Control</Text>
          {remedy?.scientific?.map((i, idx) => (
            <Text key={idx} style={styles.text}>• {i}</Text>
          ))}

          {/* 🛡 Prevention */}
          <Text style={[styles.section, { color: "#E67E22" }]}>🛡 Prevention</Text>
          {remedy?.prevention?.map((i, idx) => (
            <Text key={idx} style={styles.text}>• {i}</Text>
          ))}

          {/* 📤 Share */}
          <TouchableOpacity style={styles.shareBtn} onPress={shareRemedy}>
            <Ionicons name="share-social-outline" size={20} color="#145A32" />
            <Text style={styles.shareText}>Share Remedy</Text>
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
    height: 180,
  },

  card: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 22,
    padding: 20,
    elevation: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#145A32",
    textAlign: "center",
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  section: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E8449",
    marginTop: 14,
  },
  sectionInline: {
  fontSize: 16,
  fontWeight: "600",
  color: "#1E8449",
  },

  severityText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  text: {
    fontSize: 15,
    color: "#2C3E50",
    marginTop: 6,
    lineHeight: 22,
  },

  warningBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },

  warningText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  shareBtn: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#1E8449",
    padding: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  shareText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#145A32",
  },
});
