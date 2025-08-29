import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import InputField from "../components/InputField";
import SocialButton from "../components/SocialButton";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleCreateAccount = () => {
    // lógica para criar conta
    console.log({ name, phone, email, password, confirmPassword });
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
  secureTextEntry={false} // adicionado
/>
<InputField
  iconName="call-outline"
  placeholder="Número de telefone"
  value={phone}
  onChangeText={setPhone}
  secureTextEntry={false} // adicionado
/>
<InputField
  iconName="mail-outline"
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
  secureTextEntry={false} // adicionado
/>
      <InputField
        iconName="lock-closed-outline"
        placeholder="Digite sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      <InputField
        iconName="lock-closed-outline"
        placeholder="Digite sua senha novamente"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />

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
