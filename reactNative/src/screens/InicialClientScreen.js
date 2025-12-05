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

// Componente de Card para Agendamento Pendente
const PendingAppointmentCard = ({ appointment }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDENTE':
        return { text: 'Aguardando confirmação', color: '#FFA726', icon: 'time-outline' };
      case 'ACEITO':
        return { text: 'Confirmado', color: '#4CAF50', icon: 'checkmark-circle-outline' };
      default:
        return { text: status, color: COLORS.textSecondary, icon: 'help-outline' };
    }
  };

  // ✅ Suporte a múltiplos pets
  const getPetNames = () => {
    if (appointment.pets && appointment.pets.length > 0) {
      return appointment.pets.map(p => p.nome).join(', ');
    }
    return appointment.pet?.nome || 'Pet';
  };

  const getPetsCount = () => {
    if (appointment.pets && appointment.pets.length > 0) {
      return appointment.pets.length;
    }
    return 1;
  };

  const statusInfo = getStatusInfo(appointment.status);
  const petsCount = getPetsCount();

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentPetInfo}>
          <View style={styles.petIconContainer}>
            <Ionicons name="paw" size={20} color={COLORS.primary} />
            {petsCount > 1 && (
              <View style={styles.petCountBadge}>
                <Text style={styles.petCountText}>{petsCount}</Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.appointmentPetName}>{getPetNames()}</Text>
            <Text style={styles.appointmentDogwalker}>
              com {appointment.dogwalker?.usuario?.nome || 'Dogwalker'}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
          <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatDate(appointment.dataHora)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatTime(appointment.dataHora)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="hourglass-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{appointment.duracao} min</Text>
        </View>
      </View>
    </View>
  );
};

export default function InicialClientScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [currentWalk, setCurrentWalk] = useState(null);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Função para buscar dados
  const fetchData = useCallback(async () => {
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

      // Filtrar agendamentos PENDENTES e ACEITOS (não concluídos, não cancelados, não em andamento)
      const pending = agendamentos.filter(a => 
        a.status === 'PENDENTE' || a.status === 'ACEITO'
      );
      
      // Ordenar por data mais próxima
      pending.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
      
      setPendingAppointments(pending);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setCurrentWalk(null);
      setPendingAppointments([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  // Carregar ao montar
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Função de refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Função para refresh manual (botão)
  const handleManualRefresh = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsRefreshing(true);
    fetchData();
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

        {/* ✅ Seção de Agendamentos Pendentes */}
        {pendingAppointments.length > 0 && (
          <View style={styles.pendingSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Agendamentos Pendentes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {pendingAppointments.map((appointment) => (
              <PendingAppointmentCard 
                key={appointment.id} 
                appointment={appointment} 
              />
            ))}
          </View>
        )}

        {/* Se não tiver agendamentos pendentes */}
        {pendingAppointments.length === 0 && !currentWalk && (
          <View style={styles.noPendingCard}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.textSecondary} />
            <Text style={styles.noPendingText}>Nenhum agendamento pendente</Text>
          </View>
        )}

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
  // ✅ Estilos para seção de agendamentos pendentes
  pendingSection: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Card de agendamento
  appointmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentPetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  petIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 122, 45, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  petCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petCountText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  appointmentPetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  appointmentDogwalker: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  // Card quando não tem pendentes
  noPendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  noPendingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});