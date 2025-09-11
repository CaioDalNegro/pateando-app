import { useState } from "react";
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Crie sua conta</Text>

        <InputField
          iconName="person-outline"
          placeholder="Seu nome"
          value={name}
          onChangeText={setName} secureTextEntry={undefined}        />
        <InputField
          iconName="call-outline"
          placeholder="Número de telefone"
          value={phone}
          onChangeText={setPhone} secureTextEntry={undefined}        />
        <InputField
          iconName="mail-outline"
          placeholder="Email"
          value={email}
          onChangeText={setEmail} secureTextEntry={undefined}        />
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

        <Text style={styles.userTypeTitle}>Tipo de usuário:</Text>
        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[styles.userTypeButton, role === 'cliente' && styles.userTypeButtonActive]}
            onPress={() => setRole('cliente')}
          >
            <Text style={[styles.userTypeButtonText, role === 'cliente' && styles.userTypeButtonTextActive]}>Cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.userTypeButton, role === 'dogwalker' && styles.userTypeButtonActive]}
            onPress={() => setRole('dogwalker')}
          >
            <Text style={[styles.userTypeButtonText, role === 'dogwalker' && styles.userTypeButtonTextActive]}>Dogwalker</Text>
          </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCEFE6', // Cor de fundo do app
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Adiciona padding no topo para Android
  },
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
    color: "#222",
  },
  userTypeTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#FF7A2D',
  },
  userTypeButtonActive: {
    backgroundColor: '#FF7A2D',
  },
  userTypeButtonText: {
    color: '#FF7A2D',
    fontWeight: 'bold',
  },
  userTypeButtonTextActive: {
    color: '#fff',
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