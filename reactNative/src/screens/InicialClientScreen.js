// src/screens/InicialClientScreen.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { COLORS } from "../theme/colors";

import CardInfo from "../components/CardInfo";
import DogwalkerItem from "../components/DogwalkerItem";
import NavButton from "../components/NavButton";

// DADOS DE EXEMPLO - Substitua pelos dados da sua API
const petPasseandoAtualmente = {
  name: "Bolinha",
  imageUri:
    "https://i.pinimg.com/736x/a7/d7/7b/a7d77b1923945a2a2b9758b09f5b6b1b.jpg",
  walkInfo: { distance: "0.8", time: "25" },
};
const exampleWalkers = [
  {
    id: "1",
    name: "João Silva",
    imageUri: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.8,
    distance: "500m",
  },
  {
    id: "2",
    name: "Maria Clara",
    imageUri: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4.9,
    distance: "1.2km",
  },
  {
    id: "3",
    name: "Paulo Neto",
    imageUri: "https://randomuser.me/api/portraits/men/36.jpg",
    rating: 4.7,
    distance: "800m",
  },
];

export default function InicialClientScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [dogwalkers, setDogwalkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDogwalkers = async () => {
      try {
        // const response = await api.get('/usuarios/dogwalkers');
        // setDogwalkers(response.data);
        setDogwalkers(exampleWalkers); // Usando dados de exemplo por enquanto
      } catch (error) {
        console.error("Erro ao buscar dogwalkers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDogwalkers();
  }, []);

  const handleWalkerPress = (walker) => {
    console.log("Selecionou o walker:", walker.name);
    // navigation.navigate('WalkerProfile', { walkerId: walker.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={logout}>
          <Ionicons name="log-out-outline" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={COLORS.black}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.greeting}>Bem-vindo,</Text>
        <Text style={styles.clientName}>{user?.nome || "Cliente"}!</Text>

        <CardInfo pet={petPasseandoAtualmente} />

        <View style={styles.navButtonsContainer}>
          <NavButton
            icon="paw-outline"
            text="Meus Pets"
            onPress={() => navigation.navigate("MyPets")}
          />
          <NavButton icon="calendar-outline" text="Agenda" onPress={() => {}} />
          <NavButton icon="person-outline" text="Perfil" onPress={() => {}} />
        </View>

        <View style={styles.dogwalkersHeader}>
          <Text style={styles.dogwalkersTitle}>Dogwalkers</Text>
          <Text style={styles.findAllText}>Ver todos</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={dogwalkers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <DogwalkerItem
                walker={item}
                onPress={() => handleWalkerPress(item)}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10, paddingLeft: 20 }}
            style={{ marginHorizontal: -20 }} // Compensa o padding do container principal
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: "center",
  },
  scrollViewContent: { paddingHorizontal: 24, paddingBottom: 24 },
  greeting: { fontSize: 24, color: COLORS.textSecondary, marginTop: 8 },
  clientName: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 24,
  },
  navButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 32,
    gap: 16,
  },
  dogwalkersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dogwalkersTitle: { fontSize: 22, fontWeight: "bold", color: COLORS.primary },
  findAllText: { color: COLORS.primary, fontWeight: "600" },
});
