import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DiseaseHome from "../screens/DiseaseHome";
import ResultScreen from "../screens/ResultScreen";
import RemedyScreen from "../screens/RemedyScreen";
import HomeScreen from "../screens/HomeScreen";
import QualityPriceScreen from "../screens/QualityPriceScreen";
import VarietyCommercialScreen from "../screens/VarietyCommercialScreen";
import ProfileScreen from "../screens/ProfileScreen";
import QualityScreen from "../screens/QualityScreen";
import QualityResultScreen from "../screens/QualityResultScreen";
import PriceScreen from "../screens/PriceScreen";
import VarietyScreen from "../screens/VarietyScreen";
import CommercialScreen from "../screens/CommercialScreen";
import CommercialResultScreen from "../screens/CommercialResultScreen";
import VarietyResultScreen from "../screens/VarietyResultScreen";

const DiseaseStack = createNativeStackNavigator();
function DiseaseStackNavigator() {
  return (
    <DiseaseStack.Navigator>
      <DiseaseStack.Screen
        name="DiseaseHome"
        component={DiseaseHome}
        options={{ title: "Betel Leaf Detection" }}
      />
      <DiseaseStack.Screen
        name="Result"
        component={ResultScreen}
        options={{ title: "Prediction Result" }}
      />
      <DiseaseStack.Screen
        name="Remedy"
        component={RemedyScreen}
        options={{ title: "Treatment and Remedies" }}
      />
    </DiseaseStack.Navigator>
  );
}

const QualityPriceStack = createNativeStackNavigator();
const VarietyCommercialStack = createNativeStackNavigator();

function QualityPriceStackNavigator() {
  return (
    <QualityPriceStack.Navigator>
      <QualityPriceStack.Screen
        name="QualityPriceHome"
        component={QualityPriceScreen}
        options={{ title: "Quality & Price", headerShown: false }}
      />
      <QualityPriceStack.Screen
        name="QualityScreen"
        component={QualityScreen}
        options={{ title: "Quality Check" }}
      />
      <QualityPriceStack.Screen
        name="QualityResultScreen"
        component={QualityResultScreen}
        options={{ title: "Quality Result" }}
      />
      <QualityPriceStack.Screen
        name="PriceScreen"
        component={PriceScreen}
        options={{ title: "Price Prediction" }}
      />
    </QualityPriceStack.Navigator>
  );
}

function VarietyCommercialStackNavigator() {
  return (
    <VarietyCommercialStack.Navigator>
      <VarietyCommercialStack.Screen
        name="VarietyCommercialHome"
        component={VarietyCommercialScreen}
        options={{ title: "Variety & Commercial", headerShown: false }}
      />
      <VarietyCommercialStack.Screen
        name="VarietyScreen"
        component={VarietyScreen}
        options={{ title: "Betel Variety" }}
      />
      <VarietyCommercialStack.Screen
        name="VarietyResultScreen"
        component={VarietyResultScreen}
        options={{ title: "Variety Result" }}
      />
      <VarietyCommercialStack.Screen
        name="CommercialScreen"
        component={CommercialScreen}
        options={{ title: "Commercial Category" }}
      />
      <VarietyCommercialStack.Screen
        name="CommercialResultScreen"
        component={CommercialResultScreen}
        options={{ title: "Commercial Result" }}
      />
    </VarietyCommercialStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#eafaf1",
          tabBarInactiveTintColor: "#c8f7dc",
          tabBarStyle: {
            backgroundColor: "transparent",
            borderTopWidth: 0,
            position: "absolute",
            height: 85,
            paddingBottom: 15,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={["#0f3d2e", "#145a32"]}
              style={{ flex: 1 }}
            />
          ),
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = "home";
            if (route.name === "Home") iconName = "home";
            if (route.name === "QualityPrice") iconName = "pricetag";
            if (route.name === "Disease") iconName = "medkit";
            if (route.name === "VarietyCommercial") iconName = "layers";
            if (route.name === "Profile") iconName = "person";
            const iconSize = focused ? 30 : 22;
            return (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: focused ? 56 : 44,
                  height: focused ? 56 : 44,
                  borderRadius: 28,
                  backgroundColor: focused ? "#1e8449" : "transparent",
                }}
              >
                <Ionicons
                  name={iconName}
                  size={iconSize}
                  color={focused ? "#ffffff" : color}
                />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="QualityPrice" component={QualityPriceStackNavigator} />
        <Tab.Screen name="Disease" component={DiseaseStackNavigator} />
        <Tab.Screen
          name="VarietyCommercial"
          component={VarietyCommercialStackNavigator}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
