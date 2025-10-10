import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
// Importações de telas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import InicialClientScreen from '../screens/InicialClientScreen';
import MyPetsScreen from '../screens/MyPetsScreen';
import RegisterPetClientScreen from '../screens/RegisterPetClientScreen';
import DogWalkerHomeScreen from '../screens/DogWalkerHomeScreen';
import { COLORS } from '../theme/colors'; 

const Stack = createStackNavigator();

// === TELAS PARA USUÁRIOS NÃO AUTENTICADOS ===
const AuthScreens = () => (
    <> 
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </>
);

// === TELAS EXCLUSIVAS PARA CLIENTES ===
const ClientStack = () => (
    <>
        {/* Rotas que só Clientes podem ver */}
        <Stack.Screen name="InicialClient" component={InicialClientScreen} />
        <Stack.Screen name="MyPets" component={MyPetsScreen} />
        <Stack.Screen name="RegisterPetClient" component={RegisterPetClientScreen} />
    </>
);

// === TELAS EXCLUSIVAS PARA DOGWALKERS ===
const DogWalkerStack = () => (
    <>
        {/* Rotas que só DogWalkers podem ver */}
        <Stack.Screen name="DogWalkerHome" component={DogWalkerHomeScreen} />
    </>
);

export default function AppNavigator() {
    // É crucial que o 'user' venha com o campo 'role' ('cliente' ou 'dogwalker')
    const { user, isLoading, isAuthenticated } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    // Variáveis de controle
    let ScreenStack;
    let initialRoute;
    
    // Lógica para decidir qual Stack (conjunto de rotas) será renderizado
    if (isAuthenticated) {
        // Usuário está logado. Verifica a função.
        if (user?.role === 'cliente') {
            ScreenStack = ClientStack;
            initialRoute = 'InicialClient';
        } else if (user?.role === 'dogwalker') {
            ScreenStack = DogWalkerStack;
            initialRoute = 'DogWalkerHome';
        } else {
            // Fallback: Se o usuário está logado, mas a função é desconhecida,
            // podemos forçar o logout ou mandá-lo para a tela mais restrita (DogWalker, por ex.)
            ScreenStack = ClientStack; 
            initialRoute = 'InicialClient';
        }
    } else {
        // Usuário não está logado
        ScreenStack = AuthScreens;
        initialRoute = 'Login';
    }


    return (
        <Stack.Navigator 
            screenOptions={{ headerShown: false }}
            // Define a primeira tela do Stack que será carregado
            initialRouteName={initialRoute} 
        >
            {/* Renderiza APENAS o conjunto de telas escolhido (Auth, Client ou DogWalker) */}
            {ScreenStack()} 
        </Stack.Navigator>
    );
}