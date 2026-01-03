import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import ResultScreen from "../screens/ResultScreen";
import RemedyScreen from "../screens/RemedyScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Betel Leaf Detection" }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: "Prediction Result" }}
        />
        <Stack.Screen
          name="Remedy"
          component={RemedyScreen}
          options={{ title: "Treatment and Remedies" }}
        />








      </Stack.Navigator>
    </NavigationContainer>
  );
}