import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import InputField from "../components/InputField";
import SocialButton from "../components/SocialButton";
import RadioButton from "../components/RadioButton";
import RememberMe from "../components/RememberMe";

export default function LoginScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState("cliente");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log({ selectedRole, email, password });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Entre aqui</Text>

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

      <InputField
        iconName="mail-outline"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        secureTextEntry={false} // <- obrigatório passar boolean
      />
      <InputField
        iconName="lock-closed-outline"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <RememberMe />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Ou entre com</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialContainer}>
        <SocialButton type="google" onPress={() => {}} />
        <SocialButton type="facebook" onPress={() => {}} />
        <SocialButton type="apple" onPress={() => {}} />
      </View>

      <Text style={styles.footer}>
        Ainda não tem uma conta?{" "}
        <Text style={styles.signup} onPress={() => navigation.navigate("Register")}>
          Crie aqui
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FCEFE6",
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
  loginButton: {
    backgroundColor: "#FF7A2D",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  signup: {
    color: "#FF7A2D",
    fontWeight: "bold",
  },
});
