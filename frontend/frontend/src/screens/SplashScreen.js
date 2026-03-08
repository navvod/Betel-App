import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SplashScreen() {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="leaf" size={120} color="#9be7a6" />
        </View>
        <Text style={styles.title}>Betel App</Text>
        <Text style={styles.subtitle}>Smart Betel Leaf Analysis</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    width: 180,
    height: 180,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(155, 231, 166, 0.3)",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#eafaf1",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#c8f7dc",
    marginTop: 5,
    letterSpacing: 1.2,
  },
});
