import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView,
  ActivityIndicator, Alert, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { API_BASE } from "../config/config";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 40;

const TIPS = {
  en: [
    {
      icon: "camera-outline",
      heading: "How to Take Photos",
      items: [
        "Place the leaf on a flat, clean surface",
        "Ensure good lighting — avoid shadows",
        "Hold the camera steady and capture the full leaf",
        "Avoid blurry or tilted images",
        "Use natural daylight when possible",
      ],
    },
    {
      icon: "storefront-outline",
      heading: "Why Commercial Type Matters",
      items: [
        "Different commercial types fetch different market prices",
        "Buyers specify the exact type they require",
        "Correct classification avoids disputes during trading",
        "Knowing the type helps plan harvest and packaging",
        "Export orders often list the commercial type needed",
      ],
    },
    {
      icon: "layers-outline",
      heading: "Understanding Commercial Types",
      items: [
        "Kanda (කඳ): mature, large leaves for premium markets",
        "Keti (කෙටි): smaller, tender leaves for everyday use",
        "Korikan (කොරිකන්): aged leaves with distinct texture",
        "Peedunu (පීදුනු): fully mature leaves of highest value",
      ],
    },
  ],
  si: [
    {
      icon: "camera-outline",
      heading: "ඡායාරූප ගන්නේ කෙසේද",
      items: [
        "කොළය පැතලි, පිරිසිදු මතුපිටක් මත තබන්න",
        "හොඳ ආලෝකය සහතික කරන්න — සෙවනැලි වළකින්න",
        "කැමරාව ස්ථිරව ධරා, සම්පූර්ණ කොළය ග්‍රහණය කරන්න",
        "බොඳ හෝ නැඹුරු රූප වළකින්න",
        "හැකි විට ස්වාභාවික දිවාආලෝකය භාවිතා කරන්න",
      ],
    },
    {
      icon: "storefront-outline",
      heading: "වාණිජ වර්ගය වැදගත් වන්නේ ඇයි",
      items: [
        "විවිධ වාණිජ වර්ගවලට වෙනස් වෙළඳපල මිලක් ඇත",
        "ගැනුම්කරුවන් ඔවුන්ට අවශ්‍ය නිශ්චිත වර්ගය සඳහන් කරයි",
        "නිවැරදි වර්ගීකරණය වෙළඳාමේ ආරවුල් වළකයි",
        "වර්ගය දැනගැනීම අස්වැන්න හා ඇසුරුම් කිරීම සැලසුම් කිරීමට උපකාරී වේ",
        "අපනයන ඇණවුම් බොහෝ විට අවශ්‍ය වාණිජ වර්ගය සඳහන් කරයි",
      ],
    },
    {
      icon: "layers-outline",
      heading: "වාණිජ වර්ග තේරුම් ගැනීම",
      items: [
        "කඳ: ප්‍රිමියම් වෙළඳපල සඳහා පරිණත, විශාල කොළ",
        "කෙටි: දෛනික භාවිතය සඳහා කුඩා, නම්‍යශීලී කොළ",
        "කොරිකන්: විශේෂ ගතිලක්ෂණ සහිත පරිණත කොළ",
        "පීදුනු: ඉහළම වාණිජ වටිනාකමක් ඇති සම්පූර්ණයෙන් පරිණත කොළ",
      ],
    },
  ],
};

export default function CommercialScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [lang, setLang] = useState("en");
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

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
      const filename = image.split("/").pop() || "commercial_check.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      formData.append("image", { uri: image, name: filename, type });

      const response = await fetch(`${API_BASE}/check-commercial/`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok && !data.error) {
        navigation.navigate("CommercialResultScreen", {
          image: image,
          type: data.type,
          confidence: data.confidence,
        });
        setImage(null);
        setResult(null);
      } else {
        Alert.alert("Error", data.error || "Failed to check commercial type");
      }
    } catch (error) {
      console.log("Error checking commercial type:", error);
      Alert.alert("Error", "Network error or server is down.");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(index);
  };

  const toggleLang = () => {
    const next = lang === "en" ? "si" : "en";
    setLang(next);
    setActiveIndex(0);
    carouselRef.current?.scrollTo({ x: 0, animated: false });
  };

  const tips = TIPS[lang];

  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Check Commercial Type</Text>
            <Text style={styles.subtitle}>Capture or upload a photo to detect commercial category</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.card}>
            <ActionButton icon="camera" label="Open Camera" onPress={openCamera} />
            <ActionButton icon="images" label="Upload from Gallery" onPress={openGallery} />
          </View>

          {/* Preview & Check */}
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

          {/* Tips — hidden when image is selected */}
          {!image && (
            <View style={styles.tipsSection}>
              {/* Header row: label + toggle */}
              <View style={styles.tipsHeaderRow}>
                <View style={styles.tipsTitleRow}>
                  <Ionicons name="bulb-outline" size={18} color="#a9dfbf" style={{ marginRight: 6 }} />
                  <Text style={styles.tipsSectionTitle}>
                    {lang === "en" ? "Tips & Guide" : "උපදෙස් සහ මාර්ගෝපදේශ"}
                  </Text>
                </View>

                {/* Toggle button */}
                <TouchableOpacity style={styles.langToggle} onPress={toggleLang} activeOpacity={0.8}>
                  <View style={[styles.toggleTrack, lang === "si" && styles.toggleTrackActive]}>
                    <Text style={[styles.toggleLabelLeft, lang === "en" && styles.toggleLabelOn]}>EN</Text>
                    <View style={[styles.toggleThumb, lang === "si" && styles.toggleThumbRight]} />
                    <Text style={[styles.toggleLabelRight, lang === "si" && styles.toggleLabelOn]}>සි</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Swipeable cards */}
              <ScrollView
                ref={carouselRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                style={styles.carousel}
              >
                {tips.map((section, i) => (
                  <View key={i} style={styles.tipCard}>
                    <View style={styles.tipHeadingRow}>
                      <Ionicons name={section.icon} size={20} color="#2ECC71" style={{ marginRight: 8 }} />
                      <Text style={styles.tipHeading}>{section.heading}</Text>
                    </View>
                    {section.items.map((item, j) => (
                      <View key={j} style={styles.tipItem}>
                        <Text style={styles.tipBullet}>•</Text>
                        <Text style={styles.tipText}>{item}</Text>
                      </View>
                    ))}
                    <Text style={styles.swipeHint}>
                      {i < tips.length - 1
                        ? lang === "en" ? "Swipe for more →" : "තව සඳහා ස්වයිප් කරන්න →"
                        : lang === "en" ? "← Swipe back" : "← ආපසු ස්වයිප් කරන්න"}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              {/* Dots */}
              <View style={styles.dotsRow}>
                {tips.map((_, i) => (
                  <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const ActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <Ionicons name={icon} size={28} color="#145a32" />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
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

  /* Tips Section */
  tipsSection: {
    marginTop: 4,
  },
  tipsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tipsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipsSectionTitle: {
    color: "#a9dfbf",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  /* Language Toggle */
  langToggle: {},
  toggleTrack: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(169,223,191,0.35)",
    width: 80,
    justifyContent: "space-between",
  },
  toggleTrackActive: {
    borderColor: "#2ECC71",
  },
  toggleThumb: {
    position: "absolute",
    left: 4,
    width: 28,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2ECC71",
  },
  toggleThumbRight: {
    left: "auto",
    right: 4,
  },
  toggleLabelLeft: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(169,223,191,0.5)",
    zIndex: 1,
    width: 24,
    textAlign: "center",
  },
  toggleLabelRight: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(169,223,191,0.5)",
    zIndex: 1,
    width: 24,
    textAlign: "center",
  },
  toggleLabelOn: {
    color: "#0f3d2e",
  },

  /* Carousel */
  carousel: {
    overflow: "visible",
  },
  tipCard: {
    width: CARD_WIDTH,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(169,223,191,0.25)",
  },
  tipHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#eafaf1",
    flexShrink: 1,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 4,
  },
  tipBullet: {
    color: "#2ECC71",
    fontSize: 16,
    marginRight: 8,
    lineHeight: 22,
  },
  tipText: {
    color: "#c8f7dc",
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  swipeHint: {
    color: "rgba(169,223,191,0.5)",
    fontSize: 12,
    textAlign: "right",
    marginTop: 10,
  },

  /* Dots */
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(169,223,191,0.3)",
  },
  dotActive: {
    backgroundColor: "#2ECC71",
    width: 20,
  },
});
