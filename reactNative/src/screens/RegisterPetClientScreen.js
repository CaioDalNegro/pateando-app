import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterPetClientScreen({ navigation }) {
  const [petName, setPetName] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petInfo, setPetInfo] = useState('');

  const savePet = async () => {
    if (!petName || !petAge || !petWeight) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      // Aqui você pega o id do usuário logado, pode salvar no AsyncStorage ou Context
      const usuarioId = await AsyncStorage.getItem('usuarioId'); 

      const response = await fetch(`http://localhost:8080/pets/create/${usuarioId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: petName,
          idade: parseInt(petAge),
          raca: 'Não Informada', // ou adicionar campo de raça no formulário
          observacoes: petInfo,
          necessidadesEspeciais: petWeight // aqui você pode criar outro campo se preferir
        })
      });

      if (response.ok) {
        const petCadastrado = await response.json();
        Alert.alert('Sucesso', `Pet ${petCadastrado.nome} registrado!`);
        navigation.navigate('MyPets');
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o pet.');
      }

    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Ocorreu um erro ao conectar com o servidor.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Foto do Pet */}
      <Image
        // source={require('../assets/dog_placeholder.png')}
        style={styles.petImage}
      />
      <Text style={styles.petTitle}>{petName || 'Nome do Pet'}</Text>

      {/* Cartão: Nome */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Nome do Pet</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do seu pet"
          value={petName}
          onChangeText={setPetName}
        />
      </View>

      {/* Cartão: Idade */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Qual a idade do seu cachorro?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 3 anos"
          value={petAge}
          onChangeText={setPetAge}
          keyboardType="numeric"
        />
      </View>

      {/* Cartão: Peso */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Qual o peso do seu cachorro?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 12 kg"
          value={petWeight}
          onChangeText={setPetWeight}
          keyboardType="numeric"
        />
      </View>

      {/* Cartão: Informações adicionais */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Informações adicionais</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Ex: meu pet gosta de passear..."
          value={petInfo}
          onChangeText={setPetInfo}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={savePet}>
        <Text style={styles.buttonText}>Salvar Pet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FCEFE6',
    alignItems: 'center',
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    backgroundColor: '#FFDAB3',
  },
  petTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7A2D',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFEBD0', // bege claro
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF7A2D',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#FF7A2D',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
  },
  button: {
    backgroundColor: '#FF7A2D',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
