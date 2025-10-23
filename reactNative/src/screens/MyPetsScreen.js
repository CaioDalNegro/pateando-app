import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function MyPetsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar pets da API quando a tela for focada
  useFocusEffect(
    useCallback(() => {
      const fetchPets = async () => {
        try {
          setIsLoading(true);
          const response = await api.get(`/pets/user/${user.id}`);
          setPets(response.data);
        } catch (error) {
          console.log("Erro ao buscar pets:", error);
          Alert.alert("Erro", "Não foi possível carregar seus pets.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchPets();
    }, [user.id])
  );

  const handleRemovePress = (petName) => {
    Alert.alert(
      `Remover ${petName}`,
      "Tem certeza que deseja remover este pet?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => console.log(`Removendo ${petName}...`),
        },
      ]
    );
  };

  const renderPet = ({ item }) => (
    <View style={styles.petCard}>
      <Text style={styles.petName}>{item.nome}</Text>
      <Text style={styles.petInfo}>Idade: {item.idade} anos</Text>
      <Text style={styles.petInfo}>Peso: {item.Peso} kg</Text>
      {item.observacoes && (
        <Text style={styles.petInfo}>Info: {item.observacoes}</Text>
      )}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemovePress(item.nome)}
      >
        <Text style={styles.removeButtonText}>Remover</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Pets</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={{ flex: 1 }}
          size="large"
          color={COLORS.primary}
        />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPet}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.noPets}>
                Você ainda não tem pets cadastrados.
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("RegisterPetClient")}
      >
        <Text style={styles.addButtonText}>+ Adicionar Novo Pet</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginLeft: 16,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noPets: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  petCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  petName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 12,
  },
  petInfo: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
  },
  removeButton: {
    marginTop: 16,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  removeButtonText: { color: "#E74C3C", fontWeight: "bold" },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 16,
    margin: 24,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: { color: COLORS.white, fontWeight: "bold", fontSize: 16 },
});