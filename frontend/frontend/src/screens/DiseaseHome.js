import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE } from "../config/config";
import { SafeAreaView } from "react-native-safe-area-context";
export default function DiseaseHome({ navigation }) {
  const [image, setImage] = useState(null);

  // 📷 Camera
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Camera permission required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🖼️ Gallery
  const openGallery = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Gallery permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🔮 Predict
  const predict = async () => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: image,
        name: "leaf.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(`${API_BASE}/upload/`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      console.log("🔵 RAW RESPONSE:", text);
      const data = JSON.parse(text);

      navigation.navigate("Result", {
        image,
        disease: data.disease,
        confidence: data.confidence,
        severity: data.severity,
        remedy: data.remedy,
      });
    } catch (error) {
    console.log("❌ Prediction error:", error);
    alert(error.message || "Prediction failed");
    }
  };

  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* 🌿 Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="leaf"
            size={48}
            color="#9be7a6"
          />
          <Text style={styles.title}>Betel App</Text>
          <Text style={styles.subtitle}>
            Detect Betel Leaf Disease & Severity
          </Text>
        </View>

        {/* 📸 Action Buttons */}
        <View style={styles.card}>
          <ActionButton
            icon="camera"
            label="Open Camera"
            onPress={openCamera}
          />
          <ActionButton
            icon="image"
            label="Upload from Gallery"
            onPress={openGallery}
          />
        </View>

        {/* 🖼️ Preview */}
        {image && (
          <View style={styles.previewCard}>
            <Image source={{ uri: image }} style={styles.image} />

            <TouchableOpacity style={styles.predictBtn} onPress={predict}>
              <Ionicons name="analytics" size={22} color="#fff" />
              <Text style={styles.predictText}>Predict Disease</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

/* 🔘 Reusable Button */
const ActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <Ionicons name={icon} size={22} color="#1e8449" />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    alignItems: "center",
    marginVertical: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#eafaf1",
    marginTop: 3,
  },

  subtitle: {
    fontSize: 18,
    color: "#c8f7dc",
    textAlign: "center",
    marginTop: 3,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 13,
    marginTop: 12,
    elevation: 4,
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eafaf1",
    padding: 14,
    borderRadius: 12,
    marginVertical: 6,
  },

  actionText: {
    marginLeft: 12,
    fontSize: 18,
    color: "#145a32",
    fontWeight: "600",
  },

  previewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    elevation: 4,
  },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },

  predictBtn: {
    flexDirection: "row",
    backgroundColor: "#1e8449",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  predictText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
