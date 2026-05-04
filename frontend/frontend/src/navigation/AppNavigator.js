import React, { useContext, useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
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
import DiseaseHistoryScreen from "../screens/DiseaseHistoryScreen";
import SplashScreen from "../screens/SplashScreen";
import LoadingScreen from "../screens/LoadingScreen";
import OnboardingScreen from "../screens/OnboardingScreen";

const DiseaseStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function DiseaseStackNavigator() {
  return (
    <DiseaseStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0f3d2e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
      }}
    >
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
    <QualityPriceStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0f3d2e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
      }}
    >
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
    <VarietyCommercialStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0f3d2e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
      }}
    >
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

const ProfileStack = createNativeStackNavigator();

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0f3d2e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
      }}
    >
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: "Profile", headerShown: false }}
      />
      <ProfileStack.Screen
        name="History"
        component={DiseaseHistoryScreen}
        options={{ title: "Disease History" }}
      />
    </ProfileStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { isLoading, userToken, showOnboarding, completeOnboarding } = useContext(AuthContext);
  const [isAppReady, setIsAppReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Show splash screen for at least 2.5 seconds
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Handle fade out when loading finishes
  useEffect(() => {
    if (!isLoading && userToken) {
      setIsFading(true);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setIsFading(false);
      });
    } else {
      fadeAnim.setValue(1);
    }
  }, [isLoading, userToken]);

  if (!isAppReady) {
    return <SplashScreen />;
  }

  // Show loading screen with fade out overlay
  if (isLoading || isFading) {
    return (
      <View style={{ flex: 1 }}>
        <LoadingScreen message="Setting up your experience..." />
        {isFading && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#0f3d2e",
                opacity: fadeAnim,
              },
            ]}
          />
        )}
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? (
        showOnboarding ? (
          <OnboardingScreen onComplete={completeOnboarding} />
        ) : (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: "#eafaf1",
              tabBarInactiveTintColor: "#c8f7dc",
              tabBarStyle: {
                backgroundColor: "transparent",
                borderTopWidth: 0,
                position: "absolute",
                height: 95,
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
              tabBarLabel: "",
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen
              name="QualityPrice"
              component={QualityPriceStackNavigator}
              listeners={({ navigation }) => ({
                tabPress: (e) => {
                  e.preventDefault();
                  navigation.navigate("QualityPrice", { screen: "QualityPriceHome" });
                },
              })}
            />
            <Tab.Screen name="Disease" component={DiseaseStackNavigator} />
            <Tab.Screen
              name="VarietyCommercial"
              component={VarietyCommercialStackNavigator}
            />
            <Tab.Screen name="Profile" component={ProfileStackNavigator} />
          </Tab.Navigator>
        )
      ) : (
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
}
