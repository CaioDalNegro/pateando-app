import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export default function SelectDogWalkerScreen({ navigation, route }) {
  // Recebendo os dados da tela anterior
  const { petId, durationId, dateTime } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Escolha um Dog Walker</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.text}>Tela de Seleção de Dog Walkers.</Text>
        <Text style={styles.subText}>Em breve, mostraremos uma lista de walkers disponíveis!</Text>
        
        {/* Mostrando os dados que recebemos para teste */}
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>Dados Recebidos:</Text>
          <Text>Pet ID: {petId}</Text>
          <Text>Duração ID: {durationId}</Text>
          <Text>Data/Hora: {new Date(dateTime).toLocaleString('pt-BR')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginLeft: 16 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { fontSize: 18, color: COLORS.textPrimary, fontWeight: 'bold' },
  subText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 8 },
  debugBox: {
    marginTop: 32,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.card,
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  }
});