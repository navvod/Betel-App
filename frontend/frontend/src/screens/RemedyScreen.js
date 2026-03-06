import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAudioPlayer } from "expo-audio";           // expo-audio for MP3 playback
import NetInfoModule from "@react-native-community/netinfo"; // network connectivity check

// Backend base URL — change this to your server IP when deploying
const API_BASE = "http://192.168.8.126:8000";

export default function RemedyScreen({ route }) {

  // Extract navigation params passed from ResultScreen
  const { image, disease, severityLevel, remedy: initialRemedy } = route.params || {};

  // Normalize severity to lowercase plain format: "early" / "moderate" / "severe"
  // Handles both "Disease/early" format and plain "early" format
  const normalizedSeverity = (() => {
    if (!severityLevel) return "early";
    if (severityLevel.includes("/")) return severityLevel.split("/")[1];
    return severityLevel.toLowerCase();
  })();

  // Uppercase version used for display labels
  const SEVERITY = normalizedSeverity.toUpperCase();

  // State 
  const [remedy, setRemedy] = useState(null);       // advisory data from backend
  const [loading, setLoading] = useState(true);     // loading indicator
  const [isSpeaking, setIsSpeaking] = useState(false); // TTS playback active
  const [audioUri, setAudioUri] = useState(null);   // URI of MP3 to play
  const [isOffline, setIsOffline] = useState(false); // network status

  // expo-audio player — re-initializes whenever audioUri changes
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : null);

  //  On mount: check network then fetch remedy + audio 
  useEffect(() => {
    NetInfoModule.fetch().then((state) => {
      // Consider offline if not connected OR internet is not reachable
      const offline = !(state.isConnected && state.isInternetReachable);
      console.log("📡 Offline:", offline);
      setIsOffline(offline);
      fetchAll(offline);
    });
  }, []);

  //  Auto-play when audioUri is set
  useEffect(() => {
    if (audioUri && player) {
      player.play();
      setIsSpeaking(true);
    }
  }, [audioUri]);

  //  Detect when playback finishes and reset state
  useEffect(() => {
    if (player?.status === "idle" && isSpeaking) {
      setIsSpeaking(false);
      setAudioUri(null);
    }
  }, [player?.status]);

  //  Main fetch function 
  const fetchAll = async (offline) => {

    if (offline) {
      // OFFLINE MODE: use the rule-based remedy already returned by /api/upload/
      // No LLM, no audio — just show the basic remedy data
      if (initialRemedy) {
        setRemedy({
          risk_level: initialRemedy.warning_level || "UNKNOWN",
          cultural: initialRemedy.cultural || [],
          scientific: initialRemedy.scientific || [],
          prevention: initialRemedy.prevention || [],
          safety: [],
          audio_url: null,
          source: "offline",
        });
      }
      setLoading(false);
      return;
    }

    // ONLINE MODE: call /api/advisory-audio/ which returns:
    // LLM-enhanced remedy (cultural, scientific, prevention, safety)
    // Pre-generated Sinhala audio URL (gTTS MP3 cached by MD5 hash)
    try {
      const response = await fetch(`${API_BASE}/api/advisory-audio/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disease,
          severity: normalizedSeverity,
          online: true,
        }),
      });

      const data = await response.json();
      console.log(" Advisory+Audio:", JSON.stringify(data).slice(0, 200));
      setRemedy(data);

    } catch (error) {
      // Network error even though we detected connectivity — fall back to rule-based
      console.log(" Fetch error:", error);
      if (initialRemedy) {
        setRemedy({
          risk_level: initialRemedy.warning_level || "UNKNOWN",
          cultural: initialRemedy.cultural || [],
          scientific: initialRemedy.scientific || [],
          prevention: initialRemedy.prevention || [],
          safety: [],
          audio_url: null,
          source: "fallback",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Derived values

  // risk_level comes from LLM response; warning_level from rule-based fallback
  const riskLevel = remedy?.risk_level || remedy?.warning_level || "UNKNOWN";

  // Show AI badge only when LLM successfully enhanced the advisory
  const isAIEnhanced = remedy?.source === "llm_enhanced";

  // Build the full audio URL by prepending API_BASE to the relative media path
  // e.g. "/media/speech/speech_abc123.mp3" → "http://192.168.8.126:8000/media/speech/..."
  const remoteAudioUrl = remedy?.audio_url
    ? `${API_BASE}${remedy.audio_url}`
    : null;

  // Audio is only available when online and backend returned a URL
  const audioAvailable = !!remoteAudioUrl;

  //  Voice playback handler 
  const speakAdvisory = () => {

    // Toggle: stop if already playing
    if (isSpeaking) {
      if (player) player.pause();
      setIsSpeaking(false);
      setAudioUri(null);
      return;
    }

    // Show appropriate message if audio is unavailable
    if (!remoteAudioUrl) {
      alert(
        isOffline
          ? "Voice is not available in offline mode."
          : "Audio not ready yet."
      );
      return;
    }

    // Set URI → triggers useEffect above → player auto-plays
    console.log(" Playing:", remoteAudioUrl);
    setAudioUri(remoteAudioUrl);
  };

  // Color helpers 

  // Risk level badge color: green = LOW, yellow = MEDIUM, red = HIGH
  const getWarningColor = (l) =>
    l === "LOW" ? "#2ECC71"
      : l === "MEDIUM" ? "#F1C40F"
      : l === "HIGH" ? "#E74C3C"
      : "#95A5A6";

  // Severity badge color: green = EARLY, yellow = MODERATE, red = SEVERE
  const getSeverityColor = (l) =>
    l === "EARLY" ? "#2ECC71"
      : l === "MODERATE" ? "#F1C40F"
      : l === "SEVERE" ? "#E74C3C"
      : "#7F8C8D";

  //  Share handler: builds a plain text report 
  const shareRemedy = async () => {
    if (!remedy) return;
    await Share.share({
      message:
        `🌿 Betel Leaf Treatment\n\n` +
        `Disease: ${disease}\n` +
        `Severity: ${SEVERITY}\n` +
        `Risk: ${riskLevel}\n\n` +
        `Cultural:\n- ${(remedy.cultural || []).join("\n- ")}\n\n` +
        `Scientific:\n- ${(remedy.scientific || []).join("\n- ")}\n\n` +
        `Prevention:\n- ${(remedy.prevention || []).join("\n- ")}`
    });
  };

  //  Loading state 
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 60 }} />
        <Text style={{ color: "white", textAlign: "center", marginTop: 10 }}>
          {isOffline
            ? "Offline remedy ලබාගනිමින්..."
            : "AI Advisory සහ Voice සූදානම් කරමින්..."}
        </Text>
      </SafeAreaView>
    );
  }

  //  Empty state: no remedy data 
  const hasContent =
    (remedy?.cultural?.length || 0) > 0 ||
    (remedy?.scientific?.length || 0) > 0 ||
    (remedy?.prevention?.length || 0) > 0;

  if (!remedy || !hasContent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ alignItems: "center", marginTop: 40, padding: 20 }}>
          <Text style={{ color: "#E74C3C", fontSize: 16, textAlign: "center" }}>
            ප්‍රතිකාර තොරතුරු ලබාගත නොහැකි විය.{"\n"}
            Disease: {disease} | Severity: {normalizedSeverity}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  //  Main render 
  return (
    <SafeAreaView style={styles.container}>

      {/* Scanned leaf image */}
      <Image source={{ uri: image }} style={styles.image} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.card}>

          <Text style={styles.title}>ප්‍රතිකාර මාර්ගෝපදේශ</Text>

          {/* Status badges row */}
          <View style={styles.badgeRow}>

            {/* Show when LLM enhanced the remedy */}
            {isAIEnhanced && (
              <View style={styles.badge}>
                <Ionicons name="sparkles" size={12} color="#8E44AD" />
                <Text style={[styles.badgeText, { color: "#8E44AD" }]}>AI Enhanced</Text>
              </View>
            )}

            {/* Show when device is offline */}
            {isOffline && (
              <View style={[styles.badge, { backgroundColor: "#FEF9E7" }]}>
                <Ionicons name="cloud-offline-outline" size={12} color="#E67E22" />
                <Text style={[styles.badgeText, { color: "#E67E22" }]}>Offline Mode</Text>
              </View>
            )}

            {/* Show when audio URL was returned by backend */}
            {audioAvailable && (
              <View style={[styles.badge, { backgroundColor: "#E8F8F5" }]}>
                <Ionicons name="volume-high" size={12} color="#27AE60" />
                <Text style={[styles.badgeText, { color: "#27AE60" }]}>Voice Ready</Text>
              </View>
            )}

          </View>

          {/* Severity level with color indicator */}
          <View style={styles.row}>
            <Text style={styles.sectionInline}>බරපතළ භාවය: </Text>
            <Text style={[styles.severityText, { color: getSeverityColor(SEVERITY) }]}>
              {SEVERITY}
            </Text>
          </View>

          {/* Risk level colored badge */}
          <Text style={styles.section}>අවදානම් මට්ටම</Text>
          <View style={[styles.warningBadge, { backgroundColor: getWarningColor(riskLevel) }]}>
            <Text style={styles.warningText}>{riskLevel}</Text>
          </View>

          {/* Cultural / traditional farming practices */}
          <Text style={[styles.section, { color: "#27AE60" }]}>
            🌱 සාම්ප්‍රදායික වගා ක්‍රම
          </Text>
          {(remedy?.cultural || []).map((i, idx) => (
            <Text key={idx} style={styles.text}>• {i}</Text>
          ))}

          {/* Scientific / chemical control methods */}
          <Text style={[styles.section, { color: "#2980B9" }]}>
            🧪 විද්‍යාත්මක පාලන ක්‍රම
          </Text>
          {(remedy?.scientific || []).map((i, idx) => (
            <Text key={idx} style={styles.text}>• {i}</Text>
          ))}

          {/* Prevention methods */}
          <Text style={[styles.section, { color: "#E67E22" }]}>
            🛡 වැළැක්වීමේ ක්‍රම
          </Text>
          {(remedy?.prevention || []).map((i, idx) => (
            <Text key={idx} style={styles.text}>• {i}</Text>
          ))}

          {/* Safety tips — only shown when LLM provides them (not in rule-based) */}
          {Array.isArray(remedy?.safety) && remedy.safety.length > 0 && (
            <>
              <Text style={[styles.section, { color: "#8E44AD" }]}>
                ⚠️ ආරක්ෂක උපදෙස්
              </Text>
              {remedy.safety.map((i, idx) => (
                <Text key={idx} style={styles.text}>• {i}</Text>
              ))}
            </>
          )}

          {/* Sinhala voice playback button
              - Disabled (grey) when offline or no audio URL
              - Toggles to stop button while playing */}
          <TouchableOpacity
            style={[
              styles.listenBtn,
              isSpeaking && styles.listenBtnActive,
              !audioAvailable && styles.listenBtnDisabled,
            ]}
            onPress={speakAdvisory}
          >
            <Ionicons
              name={isSpeaking ? "stop-circle-outline" : "volume-high-outline"}
              size={22}
              color={audioAvailable ? "#145A32" : "#95A5A6"}
            />
            <Text style={[styles.listenText, !audioAvailable && { color: "#95A5A6" }]}>
              {isSpeaking
                ? "ඇසීම නවත්වන්න"
                : audioAvailable
                  ? "🎙 සිංහලෙන් ඇසීමට"
                  : "Voice unavailable (offline)"}
            </Text>
          </TouchableOpacity>

          {/* Share remedy as plain text report */}
          <TouchableOpacity style={styles.shareBtn} onPress={shareRemedy}>
            <Ionicons name="share-social-outline" size={20} color="#145A32" />
            <Text style={styles.shareText}>Remedy බෙදා හදා ගන්න</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

//  Styles 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f3d2e" },
  image: { width: "100%", height: 180 },
  card: { backgroundColor: "#fff", margin: 16, borderRadius: 22, padding: 20, elevation: 4 },
  title: { fontSize: 22, fontWeight: "bold", color: "#145A32", textAlign: "center", marginBottom: 12 },
  badgeRow: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  badge: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3E5F5", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "600", marginLeft: 4 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  section: { fontSize: 16, fontWeight: "600", color: "#1E8449", marginTop: 14 },
  sectionInline: { fontSize: 16, fontWeight: "600", color: "#1E8449" },
  severityText: { fontSize: 16, fontWeight: "bold" },
  text: { fontSize: 15, color: "#2C3E50", marginTop: 6, lineHeight: 22 },
  warningBadge: { alignSelf: "flex-start", paddingHorizontal: 18, paddingVertical: 6, borderRadius: 20, marginTop: 6 },
  warningText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  listenBtn: { flexDirection: "row", borderWidth: 1.5, borderColor: "#1E8449", backgroundColor: "#E8F8F5", padding: 14, borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 20 },
  listenBtnActive: { backgroundColor: "#F8E5FF", borderColor: "#8E44AD" },
  listenBtnDisabled: { backgroundColor: "#F2F3F4", borderColor: "#BDC3C7" },
  listenText: { marginLeft: 10, fontSize: 15, fontWeight: "700", color: "#145A32" },
  shareBtn: { flexDirection: "row", borderWidth: 1, borderColor: "#1E8449", padding: 14, borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 12 },
  shareText: { marginLeft: 8, fontSize: 15, fontWeight: "600", color: "#145A32" },
});