import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";

export default function PriceScreen() {
  // State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [district, setDistrict] = useState(null); // 'Kurunegala' | 'Gampaha'
  const [marketType, setMarketType] = useState(null); // 'Export' | 'Local'
  const [variety, setVariety] = useState(null);
  const [quality, setQuality] = useState(null); // 'Premium' | 'Standard'
  const [price, setPrice] = useState(null);

  // Constants
  const DISTRICTS = ["Kurunegala", "Gampaha"];
  const MARKET_TYPES = ["Export", "Local"];
  
  const VARIETIES_EXPORT = ["Peedunu", "Kanda"];
  const VARIETIES_LOCAL = ["Peedunu", "Kanda", "Keti", "Korikan"];
  
  const QUALITIES = ["Premium", "Standard"];

  // Logic to handle Market Type changes
  const handleMarketTypeSelect = (type) => {
    setMarketType(type);
    setVariety(null); // Reset variety
    
    if (type === "Export") {
      setQuality("Premium"); // Auto-select Premium for Export
    } else {
      setQuality(null); // Reset quality for Local
    }
  };

  // Logic to handle Variety selection
  const handleVarietySelect = (selectedVariety) => {
    setVariety(selectedVariety);
  };

  // Logic to handle Quality selection
  const handleQualitySelect = (selectedQuality) => {
    if (marketType === "Export") return; // Prevent changing if Export
    setQuality(selectedQuality);
  };

  const handleSeePrice = () => {
    if (!district || !marketType || !variety || !quality) {
      alert("Please select all fields");
      return;
    }
    // Mock price calculation
    setPrice("Rs. 1500.00");
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    
    setDate(currentDate);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  // Helper Component for Radio Button
  const RadioOption = ({ label, selected, onSelect, disabled = false }) => (
    <TouchableOpacity
      style={[
        styles.radioOption,
        selected && styles.radioOptionSelected,
        disabled && styles.radioOptionDisabled,
      ]}
      onPress={() => !disabled && onSelect(label)}
      activeOpacity={0.7}
    >
      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected, disabled && styles.radioLabelDisabled]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#0f3d2e", "#145a32"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header Title */}
          <View style={styles.header}>
            <Text style={styles.title}>Price Prediction</Text>
          </View>

          {/* 1. Date Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={toggleDatePicker}>
              <Ionicons name="calendar-outline" size={20} color="#145a32" />
              <Text style={styles.dateText}>{date.toDateString()}</Text>
            </TouchableOpacity>

            {/* Android Date Picker */}
            {showDatePicker && Platform.OS === "android" && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            {/* iOS Date Picker (Inline or Modal) */}
            {showDatePicker && Platform.OS === "ios" && (
               <View style={styles.iosDatePickerContainer}>
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    textColor="#145a32"
                  />
                  <TouchableOpacity style={styles.iosConfirmButton} onPress={() => setShowDatePicker(false)}>
                     <Text style={styles.iosConfirmText}>Confirm Date</Text>
                  </TouchableOpacity>
               </View>
            )}
          </View>

          {/* 2. District Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>District</Text>
            <View style={styles.row}>
              {DISTRICTS.map((d) => (
                <RadioOption
                  key={d}
                  label={d}
                  selected={district === d}
                  onSelect={setDistrict}
                />
              ))}
            </View>
          </View>

          {/* 3. Market Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Type</Text>
            <View style={styles.row}>
              {MARKET_TYPES.map((type) => (
                <RadioOption
                  key={type}
                  label={type}
                  selected={marketType === type}
                  onSelect={handleMarketTypeSelect}
                />
              ))}
            </View>
          </View>

          {/* 4. Variety Selection */}
          {marketType && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Variety</Text>
              <View style={styles.grid}>
                {(marketType === "Export" ? VARIETIES_EXPORT : VARIETIES_LOCAL).map((v) => (
                  <RadioOption
                    key={v}
                    label={v}
                    selected={variety === v}
                    onSelect={handleVarietySelect}
                  />
                ))}
              </View>
            </View>
          )}

          {/* 5. Quality Selection */}
          {marketType && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quality</Text>
              <View style={styles.row}>
                {QUALITIES.map((q) => (
                  <RadioOption
                    key={q}
                    label={q}
                    selected={quality === q}
                    onSelect={handleQualitySelect}
                    disabled={marketType === "Export" && q !== "Premium"}
                  />
                ))}
              </View>
              {marketType === "Export" && (
                <Text style={styles.note}>* Export only allows Premium quality</Text>
              )}
            </View>
          )}

          {/* See Price Button */}
          <TouchableOpacity style={styles.checkButton} onPress={handleSeePrice}>
            <Text style={styles.checkButtonText}>See Price</Text>
          </TouchableOpacity>

          {/* Price Display */}
          {price && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Estimated Price</Text>
              <Text style={styles.resultPrice}>{price}</Text>
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
    // backgroundColor: "#F8F9F9", // Removed to show gradient
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#eafaf1", // Changed to light color for dark background
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  // Custom Radio Button Styles
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
    minWidth: "45%",
  },
  radioOptionSelected: {
    borderColor: "#145A32",
    backgroundColor: "#E9F7EF",
  },
  radioOptionDisabled: {
    opacity: 0.5,
    backgroundColor: "#F0F0F0",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#BDC3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: "#145A32",
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#145A32",
  },
  radioLabel: {
    fontSize: 15,
    color: "#34495E",
    fontWeight: "500",
  },
  radioLabelSelected: {
    color: "#145A32",
    fontWeight: "700",
  },
  radioLabelDisabled: {
    color: "#95A5A6",
  },
  // Date Picker
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 14,
    borderRadius: 12,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#2C3E50",
  },
  iosDatePickerContainer: {
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 10,
  },
  iosConfirmButton: {
    marginTop: 10,
    backgroundColor: "#145a32",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  iosConfirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // Buttons & Results
  checkButton: {
    backgroundColor: "#fff", // Changed to white to stand out on dark gradient
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  checkButtonText: {
    color: "#145A32", // Dark green text
    fontSize: 18,
    fontWeight: "bold",
  },
  resultCard: {
    marginTop: 30,
    backgroundColor: "#eafaf1", // Light mint background
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9be7a6",
  },
  resultLabel: {
    color: "#145A32",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  resultPrice: {
    color: "#145A32",
    fontSize: 36,
    fontWeight: "bold",
  },
  note: {
    marginTop: 8,
    fontSize: 12,
    color: "#7F8C8D",
    fontStyle: "italic",
  },
});
