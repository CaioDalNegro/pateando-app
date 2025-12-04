import React, { useContext, useEffect, useState, useCallback } from "react";
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
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { COLORS } from "../theme/colors";
import CardInfo from "../components/CardInfo";
import NavButton from "../components/NavButton";
import api from "../services/api";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia,";
  if (hour < 18) return "Boa tarde,";
  return "Boa noite,";
};

export default function InicialClientScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [currentWalk, setCurrentWalk] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Função para buscar passeio em andamento
  const fetchCurrentWalk = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Buscar agendamentos do cliente
      const response = await api.get(`/agendamentos/cliente/${user.id}`);
      const agendamentos = response.data;
      
      // Procurar por passeio EM_ANDAMENTO
      const emAndamento = agendamentos.find(a => a.status === 'EM_ANDAMENTO');
      
      if (emAndamento) {
        setCurrentWalk({
          id: emAndamento.id,
          name: emAndamento.pet?.nome || 'Pet',
          imageUri: emAndamento.pet?.fotoUrl || "https://via.placeholder.com/100/FF7A2D/FFFFFF?text=Pet",
          walkInfo: { 
            distance: "0.0", 
            time: emAndamento.duracao?.toString() || "30" 
          },
          dogwalkerName: emAndamento.dogwalker?.usuario?.nome || 'Dogwalker',
        });
      } else {
        setCurrentWalk(null);
      }
    } catch (error) {
      console.error('Erro ao buscar passeio atual:', error);
      setCurrentWalk(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  // Carregar ao montar
  useEffect(() => {
    fetchCurrentWalk();
  }, [fetchCurrentWalk]);

  // Função de refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCurrentWalk();
  }, [fetchCurrentWalk]);

  // Função para refresh manual (botão)
  const handleManualRefresh = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsRefreshing(true);
    fetchCurrentWalk();
  };

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [currentWalk]); 

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.clientName}>{user?.nome || "Cliente"}!</Text>
          </View>
          <View style={styles.headerButtons}>
            {/* ✅ Botão de Refresh */}
            <TouchableOpacity onPress={handleManualRefresh} style={styles.headerButton}>
              <Ionicons 
                name={isRefreshing ? "sync" : "refresh-outline"} 
                size={26} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.headerButton}>
              <Ionicons name="log-out-outline" size={26} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Lógica Condicional: Mostra o card de passeio OU o aviso */}
        {currentWalk ? (
          <>
            <TouchableOpacity onPress={() => navigation.navigate('WalkTracker', { walkData: currentWalk })}>
              <CardInfo pet={currentWalk} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('WalkTracker', { walkData: currentWalk })}>
              <Text style={styles.ctaButtonText}>Acompanhar Passeio</Text>
              <Ionicons name="map-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </>
        ) : (
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 16 : 0,
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
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