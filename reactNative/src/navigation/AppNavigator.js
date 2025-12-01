import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import InicialClientScreen from '../screens/InicialClientScreen';
import DogWalkerHomeScreen from '../screens/DogWalkerHomeScreen';
import MyPetsScreen from '../screens/MyPetsScreen';
import RegisterPetClientScreen from '../screens/RegisterPetClientScreen';
import WalkTrackerScreen from '../screens/WalkTrackerScreen.js'; 
import FinishWalkScreen from '../screens/FinishWalkScreen';
import AgendaScreen from '../screens/AgendaScreen';
import SelectDogWalkerScreen from '../screens/SelectDogwalkerScreen';

const Stack = createStackNavigator();

// ----------------------------------------------------------------------
// 1. Telas de Autenticação (Acessíveis quando DESLOGADO)
// ----------------------------------------------------------------------
const AuthStack = () => (
  <>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </>
);

// ----------------------------------------------------------------------
// 2. Telas do Cliente (Acessíveis quando user.tipoUsuario === 'CLIENTE')
// ----------------------------------------------------------------------
const ClientAppStack = () => (
  <>
    <Stack.Screen name="InicialClient" component={InicialClientScreen} />
    <Stack.Screen name="MyPets" component={MyPetsScreen} />
    <Stack.Screen name="RegisterPetClient" component={RegisterPetClientScreen} />
    <Stack.Screen name="Agenda" component={AgendaScreen} />
    <Stack.Screen name="SelectDogWalker" component={SelectDogWalkerScreen} />
    <Stack.Screen name="WalkTracker" component={WalkTrackerScreen} />
  </>
);

// ----------------------------------------------------------------------
// 3. Telas do Dog Walker (Acessíveis quando user.tipoUsuario === 'DOGWALKER')
// ----------------------------------------------------------------------
const DogWalkerAppStack = () => (
  <>
    <Stack.Screen name="DogWalkerHome" component={DogWalkerHomeScreen} />
    <Stack.Screen name="FinishWalk" component={FinishWalkScreen} />
  </>
);

// ----------------------------------------------------------------------
// O Navigator Principal que escolhe qual Stack carregar
// ----------------------------------------------------------------------
export default function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Lógica de navegação que verifica o tipo de usuário (Role-Based Navigation) */}
      {!user ? (
        AuthStack() // Se não há usuário logado, carrega o Login/Registro
      ) : user.tipoUsuario === 'CLIENTE' ? (
        ClientAppStack() // Se for Cliente, carrega as telas de Cliente
      ) : user.tipoUsuario === 'DOGWALKER' ? (
        DogWalkerAppStack() // Se for Dog Walker, carrega as telas de Dog Walker
      ) : (
        AuthStack() // Fallback: se o tipoUsuario não for reconhecido, volta para o Login
      )}
    </Stack.Navigator>
  );
}