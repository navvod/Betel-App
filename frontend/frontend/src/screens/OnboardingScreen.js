import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const onboardingData = [
  {
    title: "AI විශ්ලේෂණය",
    description: "රෝග හඳුනා ගැනීමට, කොළ වර්ගය විශ්ලේෂණය කිරීමට සහ වාණිජ කාණ්ඩය නිවැරදිව හඳුනා ගැනීමට අපගේ උසස් AI ආකෘති භාවිත කරන්න.",
    icon: "brain",
    library: "MaterialCommunityIcons",
    tips: ["හොඳ ආලෝකය සහතික කරන්න", "කොළය මධ්‍යගත කරන්න", "බොඳ ඡායාරූප වළකින්න"],
  },
  {
    title: "ස්මාර්ට් පිළියම්",
    description: "හඳුනාගත් රෝග සඳහා විද්‍යාත්මක හා සංස්කෘතික ප්‍රතිකාර මාර්ගෝපදේශ ලබා ගන්න, මෙන්ම වෙළඳපල ප්‍රවණතා මත පදනම් වූ තත්‍ය කාල මිල පුරෝකථන ද ලබා ගන්න.",
    icon: "medkit",
    library: "Ionicons",
    tips: ["විශේෂඥ උපදෙස් අනුගමනය කරන්න", "දෛනික මිල යාවත්කාලීන කිරීම් පරීක්ෂා කරන්න", "ලුහුබැඳීම සඳහා ඉතිහාසය සුරකින්න"],
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(currentIndex + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    } else {
      onComplete();
    }
  };

  const currentData = onboardingData[currentIndex];

  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.iconContainer}>
            {currentData.library === "MaterialCommunityIcons" ? (
              <MaterialCommunityIcons name={currentData.icon} size={100} color="#9be7a6" />
            ) : (
              <Ionicons name={currentData.icon} size={100} color="#9be7a6" />
            )}
          </View>
          
          <Text style={styles.title}>{currentData.title}</Text>
          <Text style={styles.description}>{currentData.description}</Text>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>ප්‍රවීණ උපදෙස්:</Text>
            {currentData.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={22} color="#1e8449" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextText}>
              {currentIndex === onboardingData.length - 1 ? "ආරම්භ කරන්න" : "ඊළඟ"}
            </Text>
            <Ionicons name="arrow-forward" size={22} color="#145a32" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 30,
    padding: 25,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "rgba(155, 231, 166, 0.2)",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    color: "#eafaf1",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  tipsCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 24,
    marginBottom: 40,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tipsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#145a32",
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  tipText: {
    fontSize: 17,
    color: "#1e8449",
    marginLeft: 12,
    fontWeight: "600",
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 40,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    width: 28,
    backgroundColor: "#9be7a6",
  },
  inactiveDot: {
    width: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  nextBtn: {
    flexDirection: "row",
    backgroundColor: "#9be7a6",
    paddingVertical: 18,
    paddingHorizontal: 45,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#145a32",
    marginRight: 10,
  },
});
