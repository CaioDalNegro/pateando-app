import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function MyPetsScreen({ navigation }) {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const storedPets = await AsyncStorage.getItem('pets');
      if (storedPets) {
        setPets(JSON.parse(storedPets));
      }
    } catch (error) {
      console.log('Erro ao carregar pets:', error);
    }
  };

  const removePet = async (index) => {
    Alert.alert(
      "Remover Pet",
      "Tem certeza que deseja remover este pet?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedPets = pets.filter((_, i) => i !== index);
              await AsyncStorage.setItem('pets', JSON.stringify(updatedPets));
              setPets(updatedPets);
            } catch (error) {
              console.log("Erro ao remover pet:", error);
            }
          }
        }
      ]
    );
  };

  const renderPet = ({ item, index }) => (
    <View style={styles.petCard}>
      <Text style={styles.petName}>{item.name}</Text>
      <Text style={styles.petInfo}>Idade: {item.age}</Text>
      <Text style={styles.petInfo}>Peso: {item.weight}</Text>
      {item.info ? <Text style={styles.petInfo}>Info: {item.info}</Text> : null}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removePet(index)}
      >
        <Text style={styles.removeButtonText}>Remover</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FF7A2D" />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Pets</Text>
      </View>

      <FlatList
        data={pets}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderPet}
        ListEmptyComponent={() => (
          <Text style={styles.noPets}>Você ainda não tem pets cadastrados.</Text>
        )}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('RegisterPetClient')}
      >
        <Text style={styles.addButtonText}>+ Adicionar Novo Pet</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCEFE6',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7A2D',
    marginLeft: 20,
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  noPets: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  petCard: {
    backgroundColor: '#FFEBD0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7A2D',
    marginBottom: 8,
  },
  petInfo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: '#FF7A2D',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF7A2D',
    padding: 15,
    borderRadius: 12,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});