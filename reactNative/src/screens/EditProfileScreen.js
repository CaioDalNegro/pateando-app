import React, { useState, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { COLORS } from "../theme/colors";
import { AuthContext } from "../context/AuthContext";
import InputField from "../components/InputField";
import api from "../services/api";

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useContext(AuthContext);

  const [name, setName] = useState(user?.nome || "");
  const [phone, setPhone] = useState(user?.telefone || "11999998888");
  const [image, setImage] = useState(
    "https://randomuser.me/api/portraits/women/68.jpg"
  );
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permissão Necessária",
        "Você recusou o acesso à sua galeria de fotos!"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Aqui enviamos os dados de texto para a API
      const response = await api.put(`/usuarios/${user.id}`, {
        nome: name,
        telefone: phone,
      });

      // Atualiza o usuário no contexto com os dados retornados pela API
      updateUser(response.data);

      // Lógica para upload da imagem (será implementada no futuro)
      if (image !== "https://randomuser.me/api/portraits/women/68.jpg") {
        console.log("A lógica para fazer o upload da imagem viria aqui.");
      }

      Alert.alert("Sucesso", "Perfil atualizado!");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar o perfil:", error.response?.data || error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar as alterações. Tente novamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: image }} style={styles.profileImage} />
          <TouchableOpacity style={styles.editImageIcon} onPress={pickImage}>
            <Ionicons name="camera-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <InputField
          label="Nome Completo"
          iconName="person-outline"
          value={name}
          onChangeText={setName}
        />
        <InputField
          label="Email"
          iconName="mail-outline"
          value={user?.email || ""}
          editable={false}
          style={{ backgroundColor: "#f0f0f0" }} // Estilo para campo não editável
        />
        <InputField
          label="Telefone"
          iconName="call-outline"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  container: {
    padding: 24,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  editImageIcon: {
    position: "absolute",
    bottom: 5,
    right: "25%",
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 32,
    height: 55,
    justifyContent: "center",
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
