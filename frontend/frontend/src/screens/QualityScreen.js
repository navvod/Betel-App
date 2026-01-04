import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { API_BASE } from "../config/config";

export default function QualityScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 📷 Camera
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access is needed to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ 
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1] 
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null); // Reset previous result
    }
  };

  // 🖼️ Gallery
  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Gallery access is needed to select photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1]
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null); // Reset previous result
    }
  };

  // 🔍 Check Quality
  const checkQuality = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Get filename from path or default
      const filename = image.split('/').pop() || "quality_check.jpg";
      
      // Infer type from extension
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("image", {
        uri: image,
        name: filename,
        type: type,
      });

      const response = await fetch(`${API_BASE}/check-quality/`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        // Navigate to result screen instead of setting state
        navigation.navigate("QualityResultScreen", {
          image: image,
          quality: data.quality,
          confidence: data.confidence
        });
        // Clear current state
        setImage(null);
        setResult(null);
      } else {
        Alert.alert("Error", data.error || "Failed to check quality");
      }
    } catch (error) {
      console.log("Error checking quality:", error);
      Alert.alert("Error", "Network error or server is down.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Check Quality</Text>
            <Text style={styles.subtitle}>Upload or take a photo to check betel leaf quality</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.card}>
            <ActionButton icon="camera" label="Open Camera" onPress={openCamera} />
            <ActionButton icon="image" label="Upload from Gallery" onPress={openGallery} />
          </View>

          {/* Preview & Result */}
          {image && (
            <View style={styles.previewCard}>
              <Image source={{ uri: image }} style={styles.image} />

              {!result && (
                <TouchableOpacity 
                  style={styles.checkBtn} 
                  onPress={checkQuality}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={24} color="#fff" />
                      <Text style={styles.checkBtnText}>Check Quality</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* 🔘 Reusable Button */
const ActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <Ionicons name={icon} size={28} color="#145a32" />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: { marginTop: -20, marginBottom: 20, alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", color: "#eafaf1", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "#c8f7dc", textAlign: "center" },
  card: {
    backgroundColor: "#eafaf1",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#9be7a6",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#c8f7dc",
    elevation: 2,
  },
  actionText: {
    marginLeft: 15,
    fontSize: 18,
    color: "#145a32",
    fontWeight: "700",
  },
  previewCard: {
    backgroundColor: "#eafaf1",
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#9be7a6",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#c8f7dc",
  },
  checkBtn: {
    flexDirection: "row",
    backgroundColor: "#1e8449",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    elevation: 3,
  },
  checkBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  resultContainer: {
    alignItems: "center",
    marginTop: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "#9be7a6",
  },
  resultTitle: {
    fontSize: 16,
    color: "#145a32",
    fontWeight: "600",
    marginBottom: 5,
  },
  resultText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e8449",
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 14,
    color: "#555",
  },
});
