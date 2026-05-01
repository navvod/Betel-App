import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import PropTypes from "prop-types";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE } from "../config/config";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DiseaseHome({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📷 Camera
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera permission is required to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // 🖼️ Gallery
  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Gallery permission is required to select photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // 🔮 Predict
  const predict = async () => {
    if (loading || !image) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: image,
        name: "leaf.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(`${API_BASE}/upload/`, {
        method: "POST",
        // ngrok-skip-browser-warning prevents ngrok's browser warning
        // page from intercepting API responses. Remove when deploying
        // to a real server.
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
        body: formData,
      });

      // Show real server error message instead of generic alert
      if (!response.ok) {
        let errorMsg = "ශ්‍රිතය අසාර්ථක විය.";
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch (parseError) {
          // Server returned non-JSON error body — use default message
          console.log("Could not parse error response:", parseError.message);
        }

        Alert.alert(
          "❗ නිවේදනය",
          response.status === 400
            ? "මෙය බුලත් පත්‍රයක් නොවේ. කරුණාකර නිවැරදි ඡායාරූපයක් භාවිතා කරන්න."
            : errorMsg
        );
        setImage(null);
        return;
      }

      const data = await response.json();
      console.log("🔵 API Response:", JSON.stringify(data));

      if (data.error || !data.is_betel) {
        Alert.alert(
          "❗ නිවේදනය",
          data.error || "මෙය බුලත් පත්‍රයක් නොවේ. කරුණාකර නිවැරදි ඡායාරූපයක් භාවිතා කරන්න."
        );
        setImage(null);
        return;
      }

      navigation.navigate("Result", {
        image,
        diseases:    data.diseases    || [],
        confidences: data.confidences || [],
        healthy:     data.is_healthy  || false,
        severity:    data.severity,
        remedy:      data.remedy,
      });

    } catch (error) {
      console.log("❌ Prediction error:", error);

      if (
        error.message === "Network request failed" ||
        error.message?.includes("fetch")
      ) {
        Alert.alert(
          "ජාල දෝෂය",
          "සේවාදායකයට සම්බන්ධ වීමට නොහැකි විය.\n\nකරුණාකර:\n• WiFi සක්‍රිය ද?\n• Backend සේවාදායකය ක්‍රියාත්මක ද?"
        );
      } else {
        Alert.alert("දෝෂය", error.message || "Prediction failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* 🌿 Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="leaf" size={48} color="#9be7a6" />
          <Text style={styles.title}>Betel App</Text>
          <Text style={styles.subtitle}>Detect Betel Leaf Disease & Severity</Text>
        </View>

        {/* 📸 Action Buttons */}
        <View style={styles.card}>
          <ActionButton icon="camera" label="Open Camera"        onPress={openCamera}  />
          <ActionButton icon="image"  label="Upload from Gallery" onPress={openGallery} />
        </View>

        {/* 🖼️ Preview */}
        {image && (
          <View style={styles.previewCard}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={[styles.predictBtn, loading && styles.disabledBtn]}
              onPress={predict}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="analytics" size={22} color="#fff" />
                  <Text style={styles.predictText}>Predict Disease</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

// ✅ PropTypes validation — fixes all SonarLint S6774 warnings
DiseaseHome.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

// ✅ Reusable button with PropTypes
const ActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <Ionicons name={icon} size={22} color="#1e8449" />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

ActionButton.propTypes = {
  icon:    PropTypes.string.isRequired,
  label:   PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container:   { flex: 1, padding: 20 },
  header:      { alignItems: "center", marginVertical: 20 },
  title:       { fontSize: 25, fontWeight: "bold", color: "#eafaf1", marginTop: 3 },
  subtitle:    { fontSize: 18, color: "#c8f7dc", textAlign: "center", marginTop: 3 },
  card:        { backgroundColor: "#ffffff", borderRadius: 16, padding: 13, marginTop: 12, elevation: 4 },
  actionBtn:   { flexDirection: "row", alignItems: "center", backgroundColor: "#eafaf1", padding: 14, borderRadius: 12, marginVertical: 6 },
  actionText:  { marginLeft: 12, fontSize: 18, color: "#145a32", fontWeight: "600" },
  previewCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginTop: 12, elevation: 4 },
  image:       { width: "100%", height: 220, borderRadius: 12, marginBottom: 16 },
  predictBtn:  { flexDirection: "row", backgroundColor: "#1e8449", padding: 14, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  predictText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  disabledBtn: { backgroundColor: "#7f8c8d", opacity: 0.8 },
});
