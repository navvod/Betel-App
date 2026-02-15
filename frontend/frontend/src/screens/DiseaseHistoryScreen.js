import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { API_BASE } from "../config/config";

export default function DiseaseHistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/history/`);
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    // Append 'Z' to ensure it's treated as UTC if it's missing
    const dateStr = item.created_at.endsWith("Z") ? item.created_at : item.created_at + "Z";
    const date = new Date(dateStr).toLocaleString();
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.date}>{date}</Text>
          {/* <View style={[styles.badge, { backgroundColor: getSeverityColor(item.severity) }]}>
            <Text style={styles.badgeText}>{item.severity}</Text>
          </View> */}
        </View>
        <Text style={styles.disease}>Disease: {item.disease || "N/A"}</Text>
        <Text style={styles.confidence}>Confidence: {(item.confidence * 100).toFixed(2)}%</Text>
        
        {/* Handle Remedy Object Rendering */}
        {item.remedy && typeof item.remedy === 'object' ? (
           <View style={{ marginTop: 4 }}>
             <Text style={styles.remedy}>Warning: {item.remedy.warning_level}</Text>
             {item.remedy.cultural && item.remedy.cultural.length > 0 && (
               <Text style={styles.remedy} numberOfLines={2}>Tip: {item.remedy.cultural[0]}</Text>
             )}
           </View>
        ) : (
           item.remedy && <Text style={styles.remedy} numberOfLines={2}>Remedy: {item.remedy}</Text>
        )}
      </View>
    );
  };

  const getSeverityColor = (severity) => {
    if (!severity) return "#95A5A6";
    const level = severity.split("/")[1] || severity;
    if (level === "early") return "#2ECC71";
    if (level === "moderate") return "#F1C40F";
    if (level === "severe") return "#E74C3C";
    return "#95A5A6";
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Disease Checking History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#145A32" />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No history found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9f9",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#145A32",
    marginBottom: 16,
    textAlign: "center",
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#145A32",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  disease: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#145A32",
  },
  confidence: {
    fontSize: 14,
    color: "#27AE60",
    marginBottom: 4,
  },
  remedy: {
    fontSize: 14,
    color: "#34495E",
    fontStyle: "italic",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#7f8c8d",
  },
});
