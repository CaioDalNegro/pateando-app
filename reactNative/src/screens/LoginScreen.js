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
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("cliente");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    // Validação básica
    if (!email || !password) {
        setError("Por favor, preencha o email e a senha.");
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Chamar login apenas com email e password (conforme a correção do AuthContext)
      await login(email, password); 
    } catch (err) {
      // Tratamento de erro robusto que captura o erro lançado pelo AuthContext
      let errorMessage = "Ocorreu um erro ao tentar logar.";

      if (err.response && err.response.status === 401) {
          // Se o AuthContext lançou o erro 401 (Senha Incorreta)
          errorMessage = "Email ou senha inválidos. Tente novamente.";
      } else if (err.message) {
          // Outros erros (rede, servidor)
          errorMessage = err.message;
      }
      
      console.error("Erro no login:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

   return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Entre aqui</Text>

        <View style={styles.radioContainer}>
          <RadioButton
            label="Sou Cliente"
            selected={selectedRole === "cliente"}
            onPress={() => setSelectedRole("cliente")}
          />
          <RadioButton
            label="Sou DogWalker"
            selected={selectedRole === "dogwalker"}
            onPress={() => setSelectedRole("dogwalker")}
          />
        </View>

        <InputField
          iconName="mail-outline"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <InputField
          iconName="lock-closed-outline"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />

        <RememberMe
          value={remember}
          onValueChange={setRemember}
          label="Lembrar de mim"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>
          Ainda não tem uma conta?{" "}
          <Text
            style={styles.signup}
            onPress={() => navigation.navigate("Register")}
          >
            Crie aqui
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: COLORS.textPrimary,
  },
  radioContainer: { alignItems: "flex-start", marginBottom: 16, gap: 8 },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  loginText: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
  errorText: { color: COLORS.error, textAlign: "center", marginTop: 16 },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.card },
  dividerText: { marginHorizontal: 16, color: COLORS.textSecondary },
  socialContainer: { flexDirection: "row", justifyContent: "center", gap: 16 },
  footer: {
    textAlign: "center",
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 32,
  },
  signup: { color: COLORS.primary, fontWeight: "bold" },
});