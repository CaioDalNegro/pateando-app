import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import InputField from "../components/InputField";
import api from "../services/api";
import { COLORS } from "../theme/colors";


export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("cliente"); // Padrão: cliente

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateAccount = async () => {
    // 👇 CORREÇÃO: VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS (Resolve Erro 400)
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert("Erro de Validação", "Todos os campos (Nome, Telefone, Email e Senhas) são obrigatórios.");
      return;
    }
    
    // 1. Validação de Senha 
    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/usuarios", {
        nome: name,
        telefone: phone,
        email: email,
        senha: password,
        tipoUsuario: role.toUpperCase(), 
      });

      Alert.alert("Sucesso", "Usuário criado com sucesso! Faça login para continuar.");
      navigation.navigate("Login");

    } catch (err) {
      // 2. Tratamento de Erro Robusto
      let errorMessage = "Ocorreu um erro desconhecido. Tente novamente.";
      
      if (err.response) {
        // Erro retornado pela API (4xx ou 5xx)
        errorMessage = err.response.data?.message || `Erro do servidor: ${err.response.status}. Verifique se o e-mail já está em uso.`;
      } else if (err.request) {
        // Erro de rede (sem resposta do servidor)
        errorMessage = "Erro de conexão. Verifique sua rede.";
      } else {
        // Outros erros
        errorMessage = err.message || "Não foi possível completar a requisição.";
      }

      setError(errorMessage);
      console.error("Erro no cadastro:", err);
      Alert.alert("Falha no Cadastro", errorMessage);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Crie sua conta</Text>

        <InputField
          iconName="person-outline"
          placeholder="Seu nome"
          value={name}
          onChangeText={setName}
        />
        <InputField
          iconName="call-outline"
          placeholder="Número de telefone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <InputField
          iconName="mail-outline"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <InputField
          iconName="lock-closed-outline"
          placeholder="Digite sua senha (mín. 6 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <InputField
          iconName="lock-closed-outline"
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Text style={styles.userTypeTitle}>Tipo de usuário:</Text>
        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              role === "cliente" && styles.userTypeButtonActive,
            ]}
            onPress={() => setRole("cliente")}
          >
            <Text
              style={[
                styles.userTypeButtonText,
                role === "cliente" && styles.userTypeButtonTextActive,
              ]}
            >
              Cliente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              role === "dogwalker" && styles.userTypeButtonActive,
            ]}
            onPress={() => setRole("dogwalker")}
          >
            <Text
              style={[
                styles.userTypeButtonText,
                role === "dogwalker" && styles.userTypeButtonTextActive,
              ]}
            >
              Dogwalker
            </Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateAccount}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.createText}>Criar</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>
          Já tem uma conta?{" "}
          <Text
            style={styles.signin}
            onPress={() => navigation.navigate("Login")}
          >
            Entre aqui
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: COLORS.textPrimary,
  },
  userTypeTitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginTop: 10,
  },
  userTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  userTypeButtonActive: { backgroundColor: COLORS.primary },
  userTypeButtonText: { color: COLORS.primary, fontWeight: "bold" },
  userTypeButtonTextActive: { color: COLORS.white },
  createButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  createText: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
  errorText: { color: COLORS.error, textAlign: "center", marginBottom: 10 },
  footer: {
    textAlign: "center",
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 20,
  },
  signin: { color: COLORS.primary, fontWeight: "bold" },
});