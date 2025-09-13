import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meus Pets</Text>

      {pets.length === 0 ? (
        <Text style={styles.noPets}>Você ainda não tem pets cadastrados.</Text>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderPet}
          scrollEnabled={false} // já está dentro do ScrollView
        />
      )}

      {/* Botão para adicionar novo pet */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('RegisterPetClient')}
      >
        <Text style={styles.addButtonText}>+ Adicionar Novo Pet</Text>
      </TouchableOpacity>

      {/* Botão de voltar */}
      <TouchableOpacity 
        style={styles.buttonBack} 
        onPress={() => navigation.navigate('InicialClient')}
      >
        <Text style={styles.buttonBackText}>Voltar para Perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FCEFE6',
    alignItems: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF7A2D',
  },
  noPets: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  petCard: {
    width: '100%',
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
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonBack: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonBackText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
