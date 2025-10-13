import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

// Importando TODAS as telas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import InicialClientScreen from '../screens/InicialClientScreen';
import DogWalkerHomeScreen from '../screens/DogWalkerHomeScreen';
import MyPetsScreen from '../screens/MyPetsScreen';
import RegisterPetClientScreen from '../screens/RegisterPetClientScreen';
import AgendaScreen from '../screens/AgendaScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen'; // NOVO

const Stack = createStackNavigator();

const AuthStack = () => (
  <>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </>
);

const ClientAppStack = () => (
  <>
    <Stack.Screen name="InicialClient" component={InicialClientScreen} />
    <Stack.Screen name="MyPets" component={MyPetsScreen} />
    <Stack.Screen name="RegisterPetClient" component={RegisterPetClientScreen} />
    <Stack.Screen name="Agenda" component={AgendaScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </>
);

const DogWalkerAppStack = () => (
  <>
    <Stack.Screen name="DogWalkerHome" component={DogWalkerHomeScreen} />
  </>
);

export default function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        AuthStack()
      ) : user.tipoUsuario === 'cliente' ? (
        ClientAppStack()
      ) : user.tipoUsuario === 'dogwalker' ? (
        DogWalkerAppStack()
      ) : (
        AuthStack()
      )}
    </Stack.Navigator>
  );
}

