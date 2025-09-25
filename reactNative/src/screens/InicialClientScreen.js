import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CardInfo from '../components/CardInfo';
import DogwalkerItem from '../components/DogwalkerItem';
import NavButton from '../components/NavButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InicialClientScreen({ navigation }) {
  const [hasPets, setHasPets] = useState(false);

  useEffect(() => {
    const checkPets = async () => {
      const pets = await AsyncStorage.getItem('pets');
      if (pets) setHasPets(true);
    };
    checkPets();
  }, []);

  const handleMyPets = () => {
    if (hasPets) {
      navigation.navigate('MyPets');
    } else {
      navigation.navigate('RegisterPetClient');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Ionicons name="arrow-back" size={24} color="#FF7A2D" />
        </TouchableOpacity>
        <Ionicons name="notifications-outline" size={24} color="#000" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.greeting}>Bem-vindo,</Text>
        <Text style={styles.clientName}>[Nome do Cliente]!</Text>

        <CardInfo />

        <View style={styles.navButtonsContainer}>
          <NavButton icon="paw-outline" text="Meus Pets" onPress={handleMyPets} />
          <NavButton icon="calendar-outline" text="Agendamento" onPress={() => navigation.navigate('Agendamento')} />
          <NavButton icon="person-outline" text="Perfil" onPress={() => navigation.navigate('Perfil')} />
        </View>

        <View style={styles.dogwalkersHeader}>
          <Text style={styles.dogwalkersTitle}>Dogwalkers</Text>
          <Text style={styles.findAllText}>Find all</Text>
        </View>

        <DogwalkerItem name="Pedro" />
        <DogwalkerItem name="Lucas" />
        <DogwalkerItem name="Maria" />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    color: '#666',
  },
  clientName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF7A2D',
    marginBottom: 20,
  },
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    marginTop: 20,
  },
  dogwalkersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dogwalkersTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF7A2D',
  },
  findAllText: {
    color: '#FF7A2D',
    textDecorationLine: 'underline',
  },
});