import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { API_BASE } from "../config/config";

export default function VarietyScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access is needed to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

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
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const checkType = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      const filename = image.split("/").pop() || "variety_check.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      formData.append("image", { uri: image, name: filename, type });

      const response = await fetch(`${API_BASE}/check-variety/`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok) {
        // Navigate to result screen instead of setting state
        navigation.navigate("VarietyResultScreen", {
          image: image,
          type: data.type,
          confidence: data.confidence
        });
        // Clear current state
        setImage(null);
        setResult(null);
      } else {
        Alert.alert("Error", data.error || "Failed to check variety type");
      }
    } catch (error) {
      console.log("Error checking variety type:", error);
      Alert.alert("Error", "Network error or server is down.");
    } finally {
      setLoading(false);
    }
  };

  const ActionButton = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={32} color="#1e8449" />
      </View>
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Check Variety Type</Text>
            <Text style={styles.subtitle}>Capture or upload a photo to detect variety (Galdalu / Mahaneru)</Text>
          </View>

          <View style={styles.card}>
            <ActionButton icon="camera" label="Open Camera" onPress={openCamera} />
            <ActionButton icon="images" label="Upload from Gallery" onPress={openGallery} />
          </View>

          {image && (
            <View style={styles.previewCard}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity style={styles.checkBtn} onPress={checkType} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="pricetags" size={24} color="#fff" />
                    <Text style={styles.checkBtnText}>Check Type</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#a9dfbf",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: "48%",
    elevation: 5,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#d5f5e3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#145a32",
    textAlign: "center",
  },
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    width: "100%",
    alignItems: "center",
    elevation: 5,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 15,
    marginBottom: 15,
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
});
