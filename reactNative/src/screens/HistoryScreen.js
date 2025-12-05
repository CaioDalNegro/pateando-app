import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

// Componente de Card para cada agendamento
const AppointmentHistoryCard = ({ appointment, onCancel }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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
        return { text: 'Pendente', color: '#FFA726', icon: 'time-outline', bgColor: '#FFF3E0' };
      case 'ACEITO':
        return { text: 'Confirmado', color: '#4CAF50', icon: 'checkmark-circle-outline', bgColor: '#E8F5E9' };
      case 'EM_ANDAMENTO':
        return { text: 'Em andamento', color: '#2196F3', icon: 'walk-outline', bgColor: '#E3F2FD' };
      case 'CONCLUIDO':
        return { text: 'Concluído', color: '#9E9E9E', icon: 'checkmark-done-outline', bgColor: '#F5F5F5' };
      case 'CANCELADO':
        return { text: 'Cancelado', color: '#F44336', icon: 'close-circle-outline', bgColor: '#FFEBEE' };
      case 'REJEITADO':
        return { text: 'Rejeitado', color: '#F44336', icon: 'close-circle-outline', bgColor: '#FFEBEE' };
      default:
        return { text: status, color: COLORS.textSecondary, icon: 'help-outline', bgColor: '#F5F5F5' };
    }
  };

  const getPrice = (duracao) => {
    if (duracao <= 30) return 'R$ 25,00';
    if (duracao <= 60) return 'R$ 40,00';
    return 'R$ 55,00';
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

  // Verificar se pode cancelar (apenas PENDENTE ou ACEITO)
  const canCancel = appointment.status === 'PENDENTE' || appointment.status === 'ACEITO';

  const statusInfo = getStatusInfo(appointment.status);
  const petsCount = getPetsCount();

  return (
    <View style={[styles.historyCard, { borderLeftColor: statusInfo.color }]}>
      {/* Header do Card */}
      <View style={styles.cardHeader}>
        <View style={styles.petInfo}>
          <View style={styles.petIconContainer}>
            <Ionicons name="paw" size={24} color={COLORS.primary} />
            {petsCount > 1 && (
              <View style={styles.petCountBadge}>
                <Text style={styles.petCountText}>{petsCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.petDetails}>
            <Text style={styles.petName}>{getPetNames()}</Text>
            <Text style={styles.dogwalkerName}>
              com {appointment.dogwalker?.usuario?.nome || 'Dogwalker'}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
          <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
        </View>
      </View>

      {/* Detalhes */}
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{formatDate(appointment.dataHora)}</Text>
          </View>
        </View>
        
        <View style={styles.detailRowBottom}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{formatTime(appointment.dataHora)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="hourglass-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{appointment.duracao} min</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.detailText, styles.priceText]}>{getPrice(appointment.duracao)}</Text>
          </View>
        </View>
      </View>

      {/* Observações (se houver) */}
      {appointment.observacoes && (
        <View style={styles.observationsContainer}>
          <Text style={styles.observationsLabel}>Observações:</Text>
          <Text style={styles.observationsText}>{appointment.observacoes}</Text>
        </View>
      )}

      {/* ✅ Botão de Cancelar */}
      {canCancel && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => onCancel(appointment.id)}
        >
          <Ionicons name="close-circle-outline" size={20} color="#F44336" />
          <Text style={styles.cancelButtonText}>Cancelar Agendamento</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Componente de filtro
const FilterButton = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.filterButton, isActive && styles.filterButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{label}</Text>
  </TouchableOpacity>
);

export default function HistoryScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Buscar agendamentos
  const fetchAppointments = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await api.get(`/agendamentos/cliente/${user.id}`);
      const data = response.data;

      // Ordenar por ID (maior ID = criado mais recentemente)
      data.sort((a, b) => b.id - a.id);

      setAppointments(data);
      applyFilter(activeFilter, data);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, activeFilter]);

  // Aplicar filtro
  const applyFilter = (filter, data = appointments) => {
    setActiveFilter(filter);
    
    switch (filter) {
      case 'pending':
        setFilteredAppointments(data.filter(a => a.status === 'PENDENTE' || a.status === 'ACEITO'));
        break;
      case 'completed':
        setFilteredAppointments(data.filter(a => a.status === 'CONCLUIDO'));
        break;
      case 'cancelled':
        setFilteredAppointments(data.filter(a => a.status === 'CANCELADO' || a.status === 'REJEITADO'));
        break;
      default:
        setFilteredAppointments(data);
    }
  };

  // ✅ Função para cancelar agendamento
  const handleCancelAppointment = (appointmentId) => {
    Alert.alert(
      'Cancelar Agendamento',
      'Tem certeza que deseja cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/agendamentos/${appointmentId}/cancelar`, {
                clienteId: user.id
              });
              
              Alert.alert('Sucesso', 'Agendamento cancelado com sucesso!');
              
              // Recarregar lista
              fetchAppointments();
            } catch (error) {
              console.error('Erro ao cancelar:', error);
              Alert.alert(
                'Erro', 
                error.response?.data || 'Não foi possível cancelar o agendamento.'
              );
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAppointments();
  }, [fetchAppointments]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Passeios</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <FilterButton 
          label="Todos" 
          isActive={activeFilter === 'all'} 
          onPress={() => applyFilter('all')} 
        />
        <FilterButton 
          label="Pendentes" 
          isActive={activeFilter === 'pending'} 
          onPress={() => applyFilter('pending')} 
        />
        <FilterButton 
          label="Concluídos" 
          isActive={activeFilter === 'completed'} 
          onPress={() => applyFilter('completed')} 
        />
        <FilterButton 
          label="Cancelados" 
          isActive={activeFilter === 'cancelled'} 
          onPress={() => applyFilter('cancelled')} 
        />
      </View>

      {/* Lista de Agendamentos */}
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AppointmentHistoryCard 
            appointment={item} 
            onCancel={handleCancelAppointment}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhum agendamento encontrado</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'all' 
                ? 'Você ainda não fez nenhum agendamento.' 
                : 'Nenhum agendamento com este status.'}
            </Text>
            {activeFilter === 'all' && (
              <TouchableOpacity 
                style={styles.scheduleButton}
                onPress={() => navigation.navigate('Agenda')}
              >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.scheduleButtonText}>Agendar Passeio</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.card,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  // Card de histórico
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  petIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  dogwalkerName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: 12,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  observationsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  observationsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  observationsText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  // ✅ Botão de Cancelar
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
    gap: 8,
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  scheduleButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});