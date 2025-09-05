import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import InputField from "../components/InputField";
import SocialButton from "../components/SocialButton";
import api from "../services/api";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("cliente");

  const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    try {
      const response = await api.post("/usuarios", {
        nome: name,
        telefone: phone,
        email: email,
        senha: password,
        tipoUsuario: role, // envia o tipo de usuário
      });

      Alert.alert("Sucesso", "Usuário criado com sucesso!");
      console.log("Usuário criado:", response.data);

      navigation.navigate("Login");
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        Alert.alert("Erro", error.response.data);
      } else {
        Alert.alert("Erro", "Não foi possível criar a conta.");
      }
    }
  };

  const handleSocialLogin = (type) => {
    console.log(`Social login: ${type}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
      />
      <InputField
        iconName="mail-outline"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <InputField
        iconName="lock-closed-outline"
        placeholder="Digite sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <InputField
        iconName="lock-closed-outline"
        placeholder="Digite sua senha novamente"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {/* 🔽 InputField custom para tipo de usuário */}
      <View style={styles.roleContainer}>
        <Text style={styles.label}>Tipo de usuário:</Text>
        <View style={styles.roleButtons}>
          <TouchableOpacity
            style={[styles.roleButton, role === "cliente" && styles.roleButtonActive]}
            onPress={() => setRole("cliente")}
          >
            <Text style={[styles.roleText, role === "cliente" && styles.roleTextActive]}>Cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === "dogwalker" && styles.roleButtonActive]}
            onPress={() => setRole("dogwalker")}
          >
            <Text style={[styles.roleText, role === "dogwalker" && styles.roleTextActive]}>Dogwalker</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateAccount}>
        <Text style={styles.createText}>Criar</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Ou entre com</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialContainer}>
        <SocialButton type="google" onPress={() => handleSocialLogin("google")} />
        <SocialButton type="facebook" onPress={() => handleSocialLogin("facebook")} />
        <SocialButton type="apple" onPress={() => handleSocialLogin("apple")} />
      </View>

      <Text style={styles.footer}>
        Já tem uma conta?{" "}
        <Text style={styles.signin} onPress={() => navigation.navigate("Login")}>
          Entre aqui
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#222",
  },
  roleContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  roleButtons: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    overflow: "hidden",
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#FF7A2D",
  },
  roleText: {
    color: "#333",
    fontWeight: "bold",
  },
  roleTextActive: {
    color: "#fff",
  },
  createButton: {
    backgroundColor: "#FF7A2D",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  createText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  footer: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },
  signin: {
    color: "#FF7A2D",
    fontWeight: "bold",
  },
});