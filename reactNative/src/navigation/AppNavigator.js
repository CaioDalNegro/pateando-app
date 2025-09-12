import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import LoginScreen from "../screens/LoginScreen";
import InicialClientScreen from "../screens/InicialClientScreen";
import RegisterScreen from "../screens/RegisterScreen";
import RegisterPetClientScreen from "../screens/RegisterPetClientScreen";
import MyPetsScreen from "../screens/MyPetsScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="InicialClient" component={InicialClientScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RegisterPetClient" component={RegisterPetClientScreen} />
        <Stack.Screen name="MyPets" component={MyPetsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
