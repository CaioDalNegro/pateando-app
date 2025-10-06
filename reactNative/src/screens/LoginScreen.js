// src/screens/LoginScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { COLORS } from "../theme/colors";

import InputField from "../components/InputField";
import RadioButton from "../components/RadioButton";
import RememberMe from "../components/RememberMe";
import SocialButton from "../components/SocialButton";

export default function LoginScreen({ navigation }) {
  // ALTERADO: Puxamos a nova função signInForDevelopment do contexto
  const { login, signInForDevelopment } = useContext(AuthContext);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("cliente");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    // ... (esta função continua exatamente igual)
  };

  // NOVO: Função para o botão de desenvolvimento
  const handleDevLogin = () => {
    const fakeDogWalker = {
      id: 'dev-123',
      nome: 'cayZika',
      email: 'dev@pateando.com',
      tipoUsuario: 'dogwalker',
    };
    signInForDevelopment(fakeDogWalker);
    // Navega manualmente para a tela do Dog Walker
    navigation.reset({ index: 0, routes: [{ name: 'DogWalkerHome' }] });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* ... (resto do seu JSX continua igual: Title, RadioButton, InputFields, etc.) ... */}
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* 👇 NOVO: Botão visível apenas em modo de desenvolvimento 👇 */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.devButton}
            onPress={handleDevLogin}
          >
            <Text style={styles.devButtonText}>Bypass Login (Dog Walker)</Text>
          </TouchableOpacity>
        )}
        
        {/* ... (resto do JSX com social buttons e footer) ... */}
      </ScrollView>
    </SafeAreaView>
  );
}

// ALTERADO: Adicionado estilo para o botão de desenvolvimento
const styles = StyleSheet.create({
  // ... (todos os seus outros estilos continuam aqui)
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16, // Pequeno ajuste de margem
  },
  devButton: {
    backgroundColor: '#8E44AD', // Uma cor diferente para destacar que é de DEV
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  devButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  // ...
});