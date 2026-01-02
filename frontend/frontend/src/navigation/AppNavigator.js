import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import ResultScreen from "../screens/ResultScreen";

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}