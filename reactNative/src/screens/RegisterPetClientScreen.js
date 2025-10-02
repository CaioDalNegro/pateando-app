// src/screens/RegisterPetClientScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { COLORS } from '../theme/colors';

export default function RegisterPetClientScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [peso, setPeso] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // NOVO: Estados de loading e erro
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ALTERADO: Função de salvar agora é mais robusta
  const savePet = async () => {
    if (!nome || !idade || !peso) {
      Alert.alert('Erro', 'Nome, idade e peso são obrigatórios!');
      return;
    }

    setIsLoading(true);
    setError(null);

    const petData = {
      nome,
      idade: parseInt(idade),
      peso: parseFloat(peso),
      observacoes,
      // O ID do usuário será associado no backend através do token de autenticação
    };

    try {
      // ALTERADO: Usando o api.post, que já envia o token do usuário
      const response = await api.post(`/pets/create/${user.id}`, petData); // Ajuste a rota
      
      Alert.alert('Sucesso', `Pet ${response.data.nome} registrado!`);
      navigation.goBack(); // ALTERADO: Volta para a tela anterior (MyPetsScreen), que irá auto-atualizar.

    } catch (err) {
      console.error('Erro ao salvar o pet:', err.response?.data || err);
      setError('Não foi possível salvar o pet. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Cadastrar Novo Pet</Text>
        
        {/* ... Campos de formulário ... */}
        <TextInput style={styles.input} placeholder="Nome do Pet" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Idade (anos)" value={idade} onChangeText={setIdade} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Peso (kg)" value={peso} onChangeText={setPeso} keyboardType="numeric" />
        <TextInput style={[styles.input, { height: 100 }]} placeholder="Observações (opcional)" value={observacoes} onChangeText={setObservacoes} multiline />

        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <TouchableOpacity style={styles.button} onPress={savePet} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Salvar Pet</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ALTERADO: Usando cores do tema
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === 'android' ? 25 : 0 },
  container: { padding: 20, backgroundColor: COLORS.background, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 10, backgroundColor: COLORS.white, marginBottom: 15, },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, },
  errorText: { color: COLORS.error, textAlign: 'center', marginBottom: 10, fontSize: 14, },
});