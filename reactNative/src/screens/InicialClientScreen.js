import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { COLORS } from "../theme/colors";
import CardInfo from "../components/CardInfo";
import NavButton from "../components/NavButton";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Dados de exemplo para um passeio
const petPasseandoAtualmente = {
  name: "Bolinha",
  imageUri: "https://i.pinimg.com/736x/a7/d7/7b/a7d77b1923945a2a2b9758b09f5b6b1b.jpg",
  walkInfo: { distance: "0.8", time: "25" },
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia,";
  if (hour < 18) return "Boa tarde,";
  return "Boa noite,";
};

export default function InicialClientScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  // Estado para controlar o passeio atual.
  // Começa como 'null' para mostrar o aviso.
  // const [currentWalk, setCurrentWalk] = useState(null);

  // --- PARA TESTAR A TELA COM UM PASSEIO EM ANDAMENTO ---
  // Descomente a linha abaixo (e comente a linha de cima)
   const [currentWalk, setCurrentWalk] = useState(petPasseandoAtualmente);
  // ----------------------------------------------------

  useEffect(() => {
    // Anima a troca entre o card de passeio e o aviso
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [currentWalk]); 

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.clientName}>{user?.nome || "Cliente"}!</Text>
          </View>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Lógica Condicional: Mostra o card de passeio OU o aviso */}
        {currentWalk ? (
          // SE TIVER UM PASSEIO
          <>
            <TouchableOpacity onPress={() => navigation.navigate('WalkTracker')}>
              <CardInfo pet={currentWalk} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('WalkTracker')}>
              <Text style={styles.ctaButtonText}>Acompanhar Passeio</Text>
              <Ionicons name="map-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </>
        ) : (
          // SE NÃO TIVER PASSEIO (MOSTRA O AVISO)
          <>
            <View style={styles.noWalkCard}>
              <Ionicons name="walk-outline" size={32} color={COLORS.primary} />
              <Text style={styles.noWalkTitle}>Nenhum passeio em andamento</Text>
              <Text style={styles.noWalkText}>Que tal agendar uma aventura para o seu pet?</Text>
            </View>

            <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Agenda')}>
              <Text style={styles.ctaButtonText}>Agendar um Passeio</Text>
              <Ionicons name="arrow-forward-circle" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </>
        )}

        <View style={styles.navButtonsContainer}>
          <NavButton icon="paw-outline" text="Meus Pets" onPress={() => navigation.navigate('MyPets')} />
          <NavButton icon="calendar-outline" text="Agenda" onPress={() => navigation.navigate('Agenda')} />
          <NavButton icon="person-outline" text="Perfil" onPress={() => navigation.navigate('Profile')} />
        </View>
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
    paddingTop: Platform.OS === "android" ? 16 : 0,
    marginBottom: 16,
  },
  scrollViewContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 24 
  },
  greeting: { 
    fontSize: 24, 
    color: COLORS.textSecondary 
  },
  clientName: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 24,
  },
  // Estilos para o Card de Aviso
  noWalkCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  noWalkTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  noWalkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    gap: 16,
  },
});