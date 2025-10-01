// src/screens/MyPetsScreen.js
import React, { useState, useContext, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
// Importamos os dois hooks: useEffect para a web, useFocusEffect para o nativo
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { COLORS } from '../theme/colors';

export default function MyPetsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPets = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/pets/usuario/${user.id}`); // Ajuste a rota se necessário
      setPets(response.data);
    } catch (err) {
      console.error('Erro ao carregar pets:', err);
      setError('Não foi possível carregar seus pets.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // ###############################################################
  // ## ALTERAÇÃO PRINCIPAL: Lógica Multiplataforma para os Hooks ##
  // ###############################################################

  if (Platform.OS === 'web') {
    // Na Web, usamos o useEffect simples para evitar o crash.
    // Ele será executado apenas uma vez quando o componente montar.
    useEffect(() => {
      fetchPets();
    }, [fetchPets]);
  } else {
    // No iOS e Android, usamos o useFocusEffect para a melhor experiência.
    // Ele será executado toda vez que a tela ganhar foco.
    useFocusEffect(
      useCallback(() => {
        fetchPets();
      }, [fetchPets])
    );
  }
  
  // ###############################################################

  const removePet = async (petId) => {
    try {
      await api.delete(`/pets/${petId}`); // Ajuste a rota se necessário
      Alert.alert("Sucesso", "Pet removido!");
      fetchPets(); // Recarrega a lista após a remoção
    } catch (error) {
      console.error("Erro ao remover pet:", error);
      Alert.alert("Erro", "Não foi possível remover o pet.");
    }
  };

  const handleRemovePress = (petId) => {
    Alert.alert(
      "Remover Pet",
      "Tem certeza que deseja remover este pet?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => removePet(petId) }
      ]
    );
  };

  const renderPet = ({ item }) => (
    <View style={styles.petCard}>
      <Text style={styles.petName}>{item.nome}</Text>
      <Text style={styles.petInfo}>Idade: {item.idade}</Text>
      <Text style={styles.petInfo}>Peso: {item.peso} kg</Text>
      {item.observacoes ? <Text style={styles.petInfo}>Info: {item.observacoes}</Text> : null}
      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemovePress(item.id)}>
        <Text style={styles.removeButtonText}>Remover</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Pets</Text>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={pets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPet}
        ListEmptyComponent={() => (
          <Text style={styles.noPets}>Você ainda não tem pets cadastrados.</Text>
        )}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('RegisterPetClient')}>
        <Text style={styles.addButtonText}>+ Adicionar Novo Pet</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === 'android' ? 25 : 0, },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, marginLeft: 20, flex: 1, },
  listContainer: { paddingHorizontal: 20, flexGrow: 1, },
  noPets: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginTop: 50, },
  petCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 15, marginBottom: 15, elevation: 3, },
  petName: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8, },
  petInfo: { fontSize: 16, color: COLORS.textPrimary, marginBottom: 4, },
  removeButton: { marginTop: 10, backgroundColor: COLORS.primary, padding: 10, borderRadius: 8, alignItems: 'center', },
  removeButtonText: { color: COLORS.white, fontWeight: 'bold', },
  addButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, width: '90%', alignSelf: 'center', alignItems: 'center', marginBottom: 30, },
  addButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, },
  errorText: { color: COLORS.error, textAlign: 'center', marginBottom: 10, fontSize: 16 },
});