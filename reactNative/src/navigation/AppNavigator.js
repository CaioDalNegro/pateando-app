import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

// Import das telas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import InicialClientScreen from '../screens/InicialClientScreen';
import DogWalkerHomeScreen from '../screens/DogWalkerHomeScreen';
import MyPetsScreen from '../screens/MyPetsScreen';
import RegisterPetClientScreen from '../screens/RegisterPetClientScreen';
import WalkTrackerScreen from '../screens/WalkTrackerScreen'; 
import FinishWalkScreen from '../screens/FinishWalkScreen';
import AgendaScreen from '../screens/AgendaScreen';
import SelectDogWalkerScreen from '../screens/SelectDogwalkerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PaymentScreen from '../screens/PaymentScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ChatScreen from '../screens/ChatScreen'; // ✅ Nova tela de Chat

const Stack = createStackNavigator();

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
      {!user ? (
        // Telas de Autenticação (Login/Registro)
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user.tipoUsuario === 'CLIENTE' ? (
        // Telas do Cliente (Fluxo de quem contrata)
        <>
          <Stack.Screen name="InicialClient" component={InicialClientScreen} />
          <Stack.Screen name="MyPets" component={MyPetsScreen} />
          <Stack.Screen name="RegisterPetClient" component={RegisterPetClientScreen} />
          <Stack.Screen name="Agenda" component={AgendaScreen} />
          <Stack.Screen name="SelectDogWalker" component={SelectDogWalkerScreen} />
          <Stack.Screen name="WalkTracker" component={WalkTrackerScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      ) : user.tipoUsuario === 'DOGWALKER' ? (
        // Telas do Dog Walker (Fluxo de quem passeia)
        <>
          <Stack.Screen name="DogWalkerHome" component={DogWalkerHomeScreen} />
          <Stack.Screen name="FinishWalk" component={FinishWalkScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      ) : (
        // Fallback (caso algo dê errado com o tipo de usuário)
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}