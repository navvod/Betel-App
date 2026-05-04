import React, { useContext, useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PLAN_CARD_WIDTH = SCREEN_WIDTH - 48; // 24px padding each side

const PLANS = [
  {
    id: "free",
    badge: "FREE",
    title: "Free Tier",
    subtitle: "Get started at no cost",
    color: "#27AE60",
    icon: "leaf-outline",
    features: [
      { icon: "book-outline",        text: "Farming guides & educational content" },
      { icon: "scan-outline",        text: "Betel leaf identification" },
      { icon: "medkit-outline",      text: "Basic disease diagnosis" },
      { icon: "megaphone-outline",   text: "Supported by ads" },
    ],
    price: null,
    cta: "Current Plan",
    ctaActive: false,
  },
  {
    id: "premium",
    badge: "PREMIUM",
    title: "Premium Tier",
    subtitle: "Unlock the full experience",
    color: "#F39C12",
    icon: "star-outline",
    features: [
      { icon: "trending-up-outline", text: "Advanced price prediction" },
      { icon: "ribbon-outline",      text: "Leaf quality assessment" },
      { icon: "flask-outline",       text: "Remedy suggestions for diseases" },
      { icon: "ban-outline",         text: "Ad-free experience" },
    ],
    price: { monthly: "LKR 1,500 / month", annual: "LKR 15,000 / year" },
    cta: "Upgrade Now",
    ctaActive: true,
  },
];

export default function ProfileScreen({ navigation }) {
  const { logout, user } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / PLAN_CARD_WIDTH);
    setActiveIndex(index);
  };

  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── Profile Hero ── */}
          <View style={styles.hero}>
            <View style={styles.avatarRing}>
              <Ionicons name="person" size={64} color="#fff" />
            </View>
            <Text style={styles.heroEmail}>{user?.email || "Not Available"}</Text>
            <View style={styles.badgePill}>
              <Ionicons name="shield-checkmark-outline" size={13} color="#145a32" />
              <Text style={styles.badgeText}>Free Plan</Text>
            </View>
          </View>

          {/* ── Info Card ── */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#7f8c8d" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{user?.email || "Not Available"}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color="#7f8c8d" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Account Type</Text>
                <Text style={styles.infoValue}>Farmer · Trader · Exporter</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate("History")}>
              <Ionicons name="time-outline" size={22} color="#fff" />
              <Text style={styles.historyBtnText}>Disease Checking History</Text>
            </TouchableOpacity>
          </View>

          {/* ── Subscription Carousel ── */}
          <Text style={styles.planHeading}>Subscription Plans</Text>

          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            style={styles.carousel}
            contentContainerStyle={styles.carouselContent}
          >
            {PLANS.map((plan, i) => (
              <View key={plan.id} style={[styles.planCard, { borderTopColor: plan.color, borderTopWidth: 4 }]}>
                {/* Badge */}
                <View style={[styles.planBadge, { backgroundColor: plan.color }]}>
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>

                {/* Title */}
                <View style={styles.planTitleRow}>
                  <Ionicons name={plan.icon} size={24} color={plan.color} style={{ marginRight: 8 }} />
                  <Text style={styles.planTitle}>{plan.title}</Text>
                </View>
                <Text style={styles.planSubtitle}>{plan.subtitle}</Text>

                {/* Features */}
                <View style={styles.featuresSection}>
                  {plan.features.map((f, j) => (
                    <View key={j} style={styles.featureRow}>
                      <View style={[styles.featureIconBox, { backgroundColor: plan.color + "18" }]}>
                        <Ionicons name={f.icon} size={16} color={plan.color} />
                      </View>
                      <Text style={styles.featureText}>{f.text}</Text>
                    </View>
                  ))}
                </View>

                {/* Price */}
                {plan.price ? (
                  <View style={styles.priceBox}>
                    <Text style={[styles.priceMain, { color: plan.color }]}>{plan.price.monthly}</Text>
                    <Text style={styles.priceAlt}>or {plan.price.annual} (save ~17%)</Text>
                  </View>
                ) : (
                  <View style={styles.priceBox}>
                    <Text style={[styles.priceMain, { color: plan.color }]}>Free forever</Text>
                  </View>
                )}

                {/* CTA */}
                <TouchableOpacity
                  style={[
                    styles.planCta,
                    plan.ctaActive
                      ? { backgroundColor: plan.color }
                      : { backgroundColor: "#ecf0f1", borderWidth: 1, borderColor: plan.color },
                  ]}
                  activeOpacity={0.85}
                  disabled={!plan.ctaActive}
                >
                  <Text style={[styles.planCtaText, !plan.ctaActive && { color: plan.color }]}>
                    {plan.cta}
                  </Text>
                </TouchableOpacity>

                {/* Swipe hint */}
                <Text style={styles.swipeHint}>
                  {i === 0 ? "Swipe to see Premium →" : "← Swipe back"}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Dots */}
          <View style={styles.dotsRow}>
            {PLANS.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
            ))}
          </View>

          {/* Footer */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
            <Text style={styles.logoutText}>Logout from App</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Version 1.0.0</Text>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe:     { flex: 1 },
  content:  { padding: 24, paddingBottom: 120 },

  /* Hero */
  hero: { alignItems: "center", marginBottom: 24 },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroEmail: {
    fontSize: 15,
    color: "#c8f7dc",
    marginBottom: 10,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#a9dfbf",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#145a32",
  },

  /* Info Card */
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    marginBottom: 28,
  },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  infoText: { marginLeft: 14, flex: 1 },
  infoLabel: { fontSize: 12, color: "#7f8c8d", marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "600", color: "#2c3e50" },
  divider: { height: 1, backgroundColor: "#f0f0f0" },
  historyBtn: {
    flexDirection: "row",
    backgroundColor: "#145a32",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 10,
    elevation: 2,
  },
  historyBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold", marginLeft: 10 },
  logoutBtn: {
    flexDirection: "row",
    backgroundColor: "#c0392b",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    marginBottom: 16,
  },
  logoutText: { color: "#fff", fontSize: 15, fontWeight: "bold", marginLeft: 10 },

  /* Subscription */
  planHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#eafaf1",
    marginBottom: 14,
  },
  carousel: { overflow: "visible" },
  carouselContent: {},
  planCard: {
    width: PLAN_CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  planBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 14,
  },
  planBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  planTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  planTitle: { fontSize: 20, fontWeight: "800", color: "#1a1a1a" },
  planSubtitle: { fontSize: 13, color: "#7f8c8d", marginBottom: 18 },
  featuresSection: { marginBottom: 18 },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  featureIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureText: { fontSize: 14, color: "#2c3e50", flex: 1, lineHeight: 20 },
  priceBox: { marginBottom: 16 },
  priceMain: { fontSize: 18, fontWeight: "800" },
  priceAlt: { fontSize: 12, color: "#7f8c8d", marginTop: 2 },
  planCta: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  planCtaText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  swipeHint: {
    color: "#b2bec3",
    fontSize: 12,
    textAlign: "right",
  },

  /* Dots */
  dotsRow: { flexDirection: "row", justifyContent: "center", marginTop: 14, gap: 6, marginBottom: 28 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(169,223,191,0.3)" },
  dotActive: { backgroundColor: "#2ECC71", width: 20 },

  versionText: { textAlign: "center", color: "#a2d9ce", fontSize: 12 },
});
