import React, { useState, useRef } from "react";
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, Dimensions,
} from "react-native";
import PropTypes from "prop-types";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE } from "../config/config";
import { SafeAreaView } from "react-native-safe-area-context";

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
      icon: "medkit-outline",
      heading: "Why Disease Detection Matters",
      items: [
        "Early detection prevents spread to nearby plants",
        "Diseased leaves fetch significantly lower market prices",
        "Untreated diseases can destroy an entire crop",
        "Timely treatment reduces the cost of remedies",
        "Healthy leaves improve export acceptance rates",
      ],
    },
    {
      icon: "warning-outline",
      heading: "Common Betel Leaf Diseases",
      items: [
        "Bacteria Blight: water-soaked lesions that turn dark brown",
        "Brown Spot: brown circular spots scattered on the leaf",
        "Caterpillar Damage: irregular holes or chewed leaf edges",
        "Dry: withered, dry appearance due to water stress",
        "Healthy: no disease — normal green leaf",
        "Kanamadiri Haniya: local fungal infection with discolouration",
        "Leaf Spot: distinct spots caused by fungal or bacterial agents",
        "Red Spider Mite Damage: fine webbing and tiny pale stipples",
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
      icon: "medkit-outline",
      heading: "රෝග හඳුනාගැනීම වැදගත් වන්නේ ඇයි",
      items: [
        "කලින් හඳුනාගැනීම අසල් ශාකවලට පැතිරීම වළකයි",
        "රෝගී කොළ සැලකිය යුතු ලෙස අඩු වෙළඳපල මිලක් ලබා ගනී",
        "ප්‍රතිකාර නොකළ රෝග සමස්ත අස්වැන්නම විනාශ කළ හැක",
        "කාලෝචිත ප්‍රතිකාරය ප්‍රතිකාර ව්‍යය අඩු කරයි",
        "සෞඛ්‍ය සම්පන්න කොළ අපනයන පිළිගැනීමේ අනුපාතය වැඩිදියුණු කරයි",
      ],
    },
    {
      icon: "warning-outline",
      heading: "බුලත් කොළ සාමාන්‍ය රෝග",
      items: [
        "බැක්ටීරියා දිරිය: තද දුඹුරු පැහැයට හැරෙන ජල-ජල් තුවාල",
        "දුඹුරු ලප: කොළ පුරා විසිරුණු දුඹුරු රවුම් ලප",
        "කැඩිරිල්ලා හානිය: අක්‍රමවත් සිදුරු හෝ කෙටූ කොළ කෙලවරු",
        "වියළීම: ජල ආතතිය නිසා පැහැ නැති, වියළි ස්වභාවය",
        "සෞඛ්‍ය සම්පන්න: රෝගයක් නැත — සාමාන්‍ය කොළ පැහැ කොළය",
        "කැනමාදිරි හානිය: විවර්ණ කිරීම සහිත දේශීය දිලීර ආසාදනය",
        "කොළ ලප: දිලීර හෝ බැක්ටීරියා කාරකයෙන් ඇති වූ ලප",
        "රතු මකුළු මයිට් හානිය: සියුම් දැල් ජාලයක් සහ කුඩා සුදු ලප",
      ],
    },
  ],
};

export default function DiseaseHome({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera permission is required to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Gallery permission is required to select photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const predict = async () => {
    if (loading || !image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", { uri: image, name: "leaf.jpg", type: "image/jpeg" });

      const response = await fetch(`${API_BASE}/upload/`, {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "true" },
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = "ශ්‍රිතය අසාර්ථක විය.";
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch (parseError) {
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
      if (error.message === "Network request failed" || error.message?.includes("fetch")) {
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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="leaf" size={48} color="#9be7a6" />
            <Text style={styles.title}>Betel App</Text>
            <Text style={styles.subtitle}>Detect Betel Leaf Disease & Severity</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.card}>
            <ActionButton icon="camera" label="Open Camera"         onPress={openCamera}  />
            <ActionButton icon="image"  label="Upload from Gallery"  onPress={openGallery} />
          </View>

          {/* Preview */}
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

          {/* Tips — hidden when image is selected */}
          {!image && (
            <View style={styles.tipsSection}>
              {/* Header row */}
              <View style={styles.tipsHeaderRow}>
                <View style={styles.tipsTitleRow}>
                  <Ionicons name="bulb-outline" size={18} color="#a9dfbf" style={{ marginRight: 6 }} />
                  <Text style={styles.tipsSectionTitle}>
                    {lang === "en" ? "Tips & Guide" : "උපදෙස් සහ මාර්ගෝපදේශ"}
                  </Text>
                </View>

                {/* Toggle */}
                <TouchableOpacity onPress={toggleLang} activeOpacity={0.8}>
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

DiseaseHome.propTypes = {
  navigation: PropTypes.shape({ navigate: PropTypes.func.isRequired }).isRequired,
};

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
  container: { flex: 1 },
  content:   { padding: 20, paddingBottom: 120 },
  header:    { alignItems: "center", marginVertical: 20 },
  title:     { fontSize: 25, fontWeight: "bold", color: "#eafaf1", marginTop: 3 },
  subtitle:  { fontSize: 18, color: "#c8f7dc", textAlign: "center", marginTop: 3 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 13,
    marginTop: 12,
    elevation: 4,
  },
  actionBtn:   { flexDirection: "row", alignItems: "center", backgroundColor: "#eafaf1", padding: 14, borderRadius: 12, marginVertical: 6 },
  actionText:  { marginLeft: 12, fontSize: 18, color: "#145a32", fontWeight: "600" },
  previewCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginTop: 12, elevation: 4 },
  image:       { width: "100%", height: 220, borderRadius: 12, marginBottom: 16 },
  predictBtn:  { flexDirection: "row", backgroundColor: "#1e8449", padding: 14, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  predictText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  disabledBtn: { backgroundColor: "#7f8c8d", opacity: 0.8 },

  /* Tips Section */
  tipsSection: { marginTop: 16 },
  tipsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tipsTitleRow: { flexDirection: "row", alignItems: "center" },
  tipsSectionTitle: {
    color: "#a9dfbf",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  /* Language Toggle */
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
  toggleTrackActive: { borderColor: "#2ECC71" },
  toggleThumb: {
    position: "absolute",
    left: 4,
    width: 28,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2ECC71",
  },
  toggleThumbRight: { left: "auto", right: 4 },
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
  toggleLabelOn: { color: "#0f3d2e" },

  /* Carousel */
  carousel: { overflow: "visible" },
  tipCard: {
    width: CARD_WIDTH,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(169,223,191,0.25)",
  },
  tipHeadingRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  tipHeading:    { fontSize: 15, fontWeight: "700", color: "#eafaf1", flexShrink: 1 },
  tipItem:       { flexDirection: "row", marginBottom: 6, paddingLeft: 4 },
  tipBullet:     { color: "#2ECC71", fontSize: 16, marginRight: 8, lineHeight: 22 },
  tipText:       { color: "#c8f7dc", fontSize: 14, lineHeight: 22, flex: 1 },
  swipeHint:     { color: "rgba(169,223,191,0.5)", fontSize: 12, textAlign: "right", marginTop: 10 },

  /* Dots */
  dotsRow: { flexDirection: "row", justifyContent: "center", marginTop: 12, gap: 6 },
  dot:      { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(169,223,191,0.3)" },
  dotActive: { backgroundColor: "#2ECC71", width: 20 },
});
