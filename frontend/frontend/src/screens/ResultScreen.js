import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
export default function ResultScreen({ route, navigation }) {

  const {
    image,
    diseases = [],
    confidences = [],
    healthy = false,
    severity,
    remedy,
  } = route.params || {};

  const severityLevel = severity?.includes("/")
    ? severity.split("/")?.[1]
    : severity || "unknown";

  // Sort diseases by confidence to identify main and minor
  const sortedIndices = confidences
    .map((conf, index) => ({ conf, index }))
    .sort((a, b) => b.conf - a.conf);

  const mainIndex = sortedIndices.length > 0 ? sortedIndices[0].index : -1;
  const mainDisease = mainIndex !== -1 ? diseases[mainIndex] : "Unknown";
  const mainConfidence = mainIndex !== -1 ? confidences[mainIndex] : 0;
  const confidencePercent = (mainConfidence * 100).toFixed(2);

  const minorDiseases = sortedIndices
    .slice(1)
    .map((item) => ({ name: diseases[item.index], conf: item.conf }));


  // Animated value
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: mainConfidence,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, []);

  // Confidence color (red → yellow → green)
  const getConfidenceColor = () => {
    if (mainConfidence < 0.4) return "#E74C3C";
    if (mainConfidence < 0.7) return "#F1C40F";
    return "#2ECC71";
  };

  // Severity color
  const getSeverityColor = () => {
    if (healthy) return "#2ECC71";
    if (severityLevel === "early") return "#2ECC71";
    if (severityLevel === "moderate") return "#F1C40F";
    if (severityLevel === "severe") return "#E74C3C";
    return "#95A5A6";
  };

  // Share report
  const shareReport = async () => {
    const report = `
🌿 Betel Leaf Disease Report

${
  healthy
    ? "Status: Healthy Leaf"
    : `Diseases: ${diseases.join(", ")}`
}
Main Confidence : ${confidencePercent}%
Severity Level  : ${severityLevel.toUpperCase()}
  `;

    await Share.share({ message: report });
  };


  // Animated width
  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Image */}
      <Image source={{ uri: image }} style={styles.image} />
      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
      {/* Card */}
      <View style={styles.card}>
        {/* Highlighted Disease */}
        <View style={styles.diseaseBox}>
          <Text style={styles.diseaseLabel}>
            {healthy ? "Status" : "ප්‍රධානතම රෝගය"}
          </Text>
          <Text style={styles.diseaseName}>
            {healthy ? "Healthy Leaf" : mainDisease}
          </Text>
        </View>

        {/* Minor Diseases */}
        {!healthy && minorDiseases.length > 0 && (
          <View style={styles.minorSection}>
            <Text style={styles.label}>ද්විතියික රෝග(ය)</Text>
            {minorDiseases.map((d, i) => (
              <View key={i} style={styles.minorItem}>
                <Ionicons name="alert-circle-outline" size={16} color="#E67E22" />
                <Text style={styles.minorText}>
                  {d.name} ({(d.conf * 100).toFixed(1)}%)
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Confidence */}
        <Text style={styles.label}>
          {healthy ? "Confidence Score" : "ප්‍රධාන රෝගයේ විශ්වාසනීය මට්ටම"}
        </Text>
        <Text
          style={[styles.percent, { color: getConfidenceColor() }]}
        >
          {confidencePercent}%
        </Text>

        {/* Animated Progress Bar */}
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: animatedWidth,
                backgroundColor: getConfidenceColor(),
              },
            ]}
          />
        </View>

        {/* Severity - Only if NOT healthy */}
        {!healthy && (
          <>
            <Text style={styles.label}>ප්‍රධාන රෝගයේ බරපතල භාවය</Text>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor() },
              ]}
            >
              <Text style={styles.severityText}>
                {severityLevel.toUpperCase()}
              </Text>
            </View>
          </>
        )}

        {/* 👉 View Remedy Button - Only if NOT healthy */}
        {!healthy && (
          <TouchableOpacity
            style={styles.remedyBtn}
            onPress={() =>
              navigation.navigate("Remedy", {
                image,
                disease: mainDisease,
                severityLevel,
                remedy,
              })
            }
          >
            <Ionicons name="medkit-outline" size={20} color="#fff" />
            <Text style={styles.remedyBtnText}>
              ප්‍රතිකාර සහ පිළියම්
            </Text>
          </TouchableOpacity>
        )}

        {/* Share Report */}
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={shareReport}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color="#145A32"
          />
          <Text style={styles.shareText}>බෙදා හරින්න</Text>
        </TouchableOpacity>

        {/* Scan Again */}
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => navigation.navigate("DiseaseHome")}
        >
          <Ionicons name="scan" size={22} color="#fff" />
          <Text style={styles.scanText}>නැවත පරීක්ෂාව</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f3d2e",
  },

  image: {
    width: "100%",
    height: 200,
  },

  card: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 22,
    padding: 20,
    elevation: 4,
  },

  diseaseBox: {
    backgroundColor: "#E9F7EF",
    borderRadius: 18,
    padding: 6,
    alignItems: "center",
    marginBottom: 2,
  },

  diseaseLabel: {
    fontSize: 14,
    color: "#1E8449",
    fontWeight: "600",
  },

  diseaseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#145A32",
    marginTop: 5,
    textAlign: "center",
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#145A32",
    marginTop: 12,
  },

  percent: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 3,
  },

  progressBarBackground: {
    height: 14,
    backgroundColor: "#ECF0F1",
    borderRadius: 10,
    marginTop: 6,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    borderRadius: 10,
  },

  minorSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#FEF5E7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FAD7A0",
  },

  minorItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  minorText: {
    fontSize: 16,
    color: "#D35400",
    marginLeft: 6,
    fontWeight: "500",
  },

  severityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },

  severityText: {
    color: "#fff",
    fontWeight: "bold",
  },

  remedyBtn: {
    flexDirection: "row",
    backgroundColor: "#145A32",
    padding: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },

  remedyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 8,
  },

  shareBtn: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#1E8449",
    padding: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  shareText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#145A32",
  },

  scanBtn: {
    flexDirection: "row",
    backgroundColor: "#1E8449",
    padding: 16,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  scanText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
