import React, { useState, useMemo, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Switch, 
  LayoutAnimation, UIManager, Platform, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { Calendar, CalendarList, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../theme/colors';
import AgendaItem from '../components/AgendaItem';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  dayNames: [
    'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia,";
  if (hour < 18) return "Boa tarde,";
  return "Boa noite,";
};

// Função para formatar data do agendamento para string de data (YYYY-MM-DD)
const formatDateToString = (dateTimeStr) => {
  if (!dateTimeStr) return null;
  const date = new Date(dateTimeStr);
  return date.toISOString().split('T')[0];
};

// Função para formatar horário
const formatTime = (dateTimeStr, duracao) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  const startHour = date.getHours().toString().padStart(2, '0');
  const startMin = date.getMinutes().toString().padStart(2, '0');
  
  const endDate = new Date(date.getTime() + duracao * 60000);
  const endHour = endDate.getHours().toString().padStart(2, '0');
  const endMin = endDate.getMinutes().toString().padStart(2, '0');
  
  return `${startHour}:${startMin} - ${endHour}:${endMin}`;
};

// Função para calcular preço baseado na duração
const calculatePrice = (duracao) => {
  if (duracao <= 30) return 25.00;
  if (duracao <= 60) return 40.00;
  return 55.00;
};

export default function DogWalkerHomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isMonthView, setIsMonthView] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  
  // Estados para dados da API
  const [allAppointments, setAllAppointments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Buscar agendamentos do dogwalker
  const fetchAppointments = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await api.get(`/agendamentos/dogwalker/usuario/${user.id}`);
      const agendamentos = response.data;
      
      // Organizar agendamentos por data
      const appointmentsByDate = {};
      agendamentos.forEach(ag => {
        const dateStr = formatDateToString(ag.dataHora);
        if (!dateStr) return;
        
        if (!appointmentsByDate[dateStr]) {
          appointmentsByDate[dateStr] = [];
        }
        
        // Mapear status do backend para o formato do frontend
        let frontendStatus = 'scheduled';
        if (ag.status === 'EM_ANDAMENTO') frontendStatus = 'active';
        else if (ag.status === 'CONCLUIDO') frontendStatus = 'completed';
        else if (ag.status === 'PENDENTE') frontendStatus = 'pending';
        else if (ag.status === 'ACEITO') frontendStatus = 'scheduled';
        else if (ag.status === 'REJEITADO' || ag.status === 'CANCELADO') frontendStatus = 'cancelled';
        
        appointmentsByDate[dateStr].push({
          id: ag.id.toString(),
          petName: ag.pet?.nome || 'Pet',
          clientName: ag.cliente?.nome || 'Cliente',
          time: formatTime(ag.dataHora, ag.duracao),
          price: calculatePrice(ag.duracao),
          status: frontendStatus,
          backendStatus: ag.status,
          duracao: ag.duracao,
          observacoes: ag.observacoes,
        });
      });
      
      setAllAppointments(appointmentsByDate);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      // Se for 404, significa que não há dogwalker cadastrado para este usuário
      if (error.response?.status === 400 || error.response?.status === 404) {
        setAllAppointments({});
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAppointments();
  }, [fetchAppointments]);

  const appointmentsForDay = useMemo(() => {
    const appointments = allAppointments[selectedDate] || [];
    return appointments.sort((a, b) => parseInt(a.time.split(':')[0]) - parseInt(b.time.split(':')[0]));
  }, [selectedDate, allAppointments]);

  const daySummary = useMemo(() => {
    const totalAppointments = appointmentsForDay.filter(a => a.status !== 'cancelled').length;
    const totalEarnings = appointmentsForDay
      .filter(a => a.status !== 'cancelled')
      .reduce((sum, app) => sum + app.price, 0);
    return { totalAppointments, totalEarnings };
  }, [appointmentsForDay]);
  
  const nextAppointmentId = useMemo(() => {
    const activeOrScheduled = appointmentsForDay.filter(a => a.status === 'active' || a.status === 'scheduled');
    return activeOrScheduled.length > 0 ? activeOrScheduled[0].id : null;
  }, [appointmentsForDay]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [appointmentsForDay]);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handleDayPress = (day) => {
    triggerHaptic();
    setSelectedDate(day.dateString);
  };

  const handleStatusChange = async (status) => {
    triggerHaptic();
    setAvailabilityStatus(status);
    
    // Atualizar disponibilidade no backend
    try {
      await api.put(`/dogwalkers/usuario/${user.id}/disponibilidade`, {
        disponibilidade: status === 'available' ? 'DISPONIVEL' : 'INDISPONIVEL'
      });
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
    }
  };

  // Aceitar agendamento pendente
  const handleAcceptAppointment = async (appointmentId) => {
    try {
      await api.put(`/agendamentos/${appointmentId}/aceitar`, {
        dogwalkerUsuarioId: user.id
      });
      Alert.alert('Sucesso!', 'Agendamento aceito com sucesso!');
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao aceitar agendamento:', error);
      Alert.alert('Erro', error.response?.data || 'Não foi possível aceitar o agendamento.');
    }
  };

  // Rejeitar agendamento pendente
  const handleRejectAppointment = async (appointmentId) => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja rejeitar este agendamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Rejeitar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/agendamentos/${appointmentId}/rejeitar`, {
                dogwalkerUsuarioId: user.id
              });
              Alert.alert('OK', 'Agendamento rejeitado.');
              fetchAppointments();
            } catch (error) {
              console.error('Erro ao rejeitar agendamento:', error);
              Alert.alert('Erro', error.response?.data || 'Não foi possível rejeitar o agendamento.');
            }
          }
        }
      ]
    );
  };

  // Iniciar passeio
  const handleStartWalk = async (appointmentId) => {
    try {
      await api.put(`/agendamentos/${appointmentId}/iniciar`, {
        dogwalkerUsuarioId: user.id
      });
      Alert.alert('Passeio Iniciado! 🐕', 'Bom passeio!');
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao iniciar passeio:', error);
      Alert.alert('Erro', error.response?.data || 'Não foi possível iniciar o passeio.');
    }
  };

  // Navega para a tela de finalização de passeio
  const handleFinishWalk = (appointment) => {
    const mockWalkData = {
      appointmentId: appointment.id,
      petName: appointment.petName,
      duration: `${appointment.duracao} minutos`,
      distance: '2.1 km',
      dogwalkerName: user?.nome || 'Dogwalker'
    };
    navigation.navigate('FinishWalk', { walkData: mockWalkData });
  };

  // Marcar datas com agendamentos no calendário
  const markedDates = useMemo(() => {
    const marks = {};
    Object.keys(allAppointments).forEach(date => {
      if (allAppointments[date].length > 0) {
        marks[date] = { marked: true, dotColor: COLORS.primary };
      }
    });
    marks[selectedDate] = { 
      ...marks[selectedDate], 
      selected: true, 
      selectedColor: COLORS.primary 
    };
    return marks;
  }, [selectedDate, allAppointments]);

  const calendarProps = { 
    current: selectedDate, 
    onDayPress: handleDayPress, 
    markedDates, 
    theme: calendarTheme 
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando agenda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.welcomeTitle}>{getGreeting()}</Text>
                <Text style={styles.welcomeName}>{user?.nome || 'Dogwalker'}</Text>
              </View>
              <TouchableOpacity onPress={logout}><Ionicons name="log-out-outline" size={28} color={COLORS.primary} /></TouchableOpacity>
            </View>

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                Para hoje você tem <Text style={styles.summaryHighlight}>{daySummary.totalAppointments} passeios</Text>,
                totalizando <Text style={styles.summaryHighlight}>R$ {daySummary.totalEarnings.toFixed(2)}</Text>
              </Text>
            </View>
            
            <View style={styles.statusContainer}>
              <TouchableOpacity style={[styles.statusButton, availabilityStatus === 'available' && styles.statusButtonActiveGreen]} onPress={() => handleStatusChange('available')}>
                <Text style={[styles.statusButtonText, availabilityStatus === 'available' && styles.statusTextActive]}>Disponível</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statusButton, availabilityStatus === 'unavailable' && styles.statusButtonActiveRed]} onPress={() => handleStatusChange('unavailable')}>
                <Text style={[styles.statusButtonText, availabilityStatus === 'unavailable' && styles.statusTextActive]}>Indisponível</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarHeader}>
              <Text style={styles.monthText}>{new Date(selectedDate.replace(/-/g, '/')).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</Text>
              <View style={styles.switchContainer}>
                <TouchableOpacity onPress={() => { triggerHaptic(); setSelectedDate(getTodayDate()); }} style={styles.todayButton}><Text style={styles.todayButtonText}>Hoje</Text></TouchableOpacity>
                <Text style={styles.switchLabel}>Mês</Text>
                <Switch onValueChange={() => { triggerHaptic(); setIsMonthView(!isMonthView); }} value={isMonthView} />
              </View>
            </View>

            <View style={styles.calendarWrapper}>
              {isMonthView ? <Calendar {...calendarProps} /> : <CalendarList horizontal pagingEnabled calendarHeight={80} renderHeader={() => <View />} {...calendarProps} />}
            </View>

            <Text style={styles.agendaTitle}>Agendamentos de {new Date(selectedDate.replace(/-/g, '/')).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</Text>
          </>
        }
        data={appointmentsForDay}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <View style={styles.agendaItemWrapper}>
                <AgendaItem appointment={item} isNext={item.id === nextAppointmentId} />
                
                {/* Botões de ação baseado no status */}
                {item.status === 'pending' && (
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.acceptButton]} 
                      onPress={() => handleAcceptAppointment(item.id)}
                    >
                      <Ionicons name="checkmark" size={20} color={COLORS.white} />
                      <Text style={styles.actionButtonText}>Aceitar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.rejectButton]} 
                      onPress={() => handleRejectAppointment(item.id)}
                    >
                      <Ionicons name="close" size={20} color={COLORS.white} />
                      <Text style={styles.actionButtonText}>Rejeitar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === 'scheduled' && (
                  <TouchableOpacity 
                    style={styles.startWalkButton} 
                    onPress={() => handleStartWalk(item.id)}
                  >
                    <Text style={styles.startWalkButtonText}>Iniciar Passeio</Text>
                    <Ionicons name="play-circle-outline" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                )}
                
                {item.status === 'active' && (
                    <TouchableOpacity style={styles.finishButton} onPress={() => handleFinishWalk(item)}>
                        <Text style={styles.finishButtonText}>Finalizar Passeio</Text>
                        <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                )}
            </View>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={40} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>Sem agendamentos neste dia.</Text>
                <Text style={styles.emptySubtext}>Puxe para baixo para atualizar</Text>
            </View>
        }
      />
    </SafeAreaView>
  );
}


// OMITIDO: O código de estilo e tema do calendário que você já tem
const calendarTheme = { 
    calendarBackground: COLORS.background,
    selectedDayBackgroundColor: COLORS.primary,
    selectedDayTextColor: COLORS.white,
    todayTextColor: COLORS.primary,
    dayTextColor: COLORS.textPrimary,
    textDisabledColor: COLORS.textSecondary,
    dotColor: COLORS.primary,
    selectedDotColor: COLORS.white,
    arrowColor: COLORS.primary,
    monthTextColor: COLORS.textPrimary,
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: 'bold',
    textDayFontSize: 14,
    textMonthFontSize: 16,
};
const styles = StyleSheet.create({ 
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
    marginBottom: 16,
  },
  welcomeTitle: { fontSize: 20, color: COLORS.textSecondary },
  welcomeName: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  summaryContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginVertical: 10,
  },
  summaryText: { fontSize: 16, color: COLORS.textPrimary },
  summaryHighlight: { fontWeight: 'bold', color: COLORS.primary },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 24,
    marginBottom: 20,
  },
  statusButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.card,
  },
  statusButtonActiveGreen: { 
    backgroundColor: '#E8F5E9', 
    borderColor: '#4CAF50', 
  },
  statusButtonActiveRed: { 
    backgroundColor: '#FFEBEE', 
    borderColor: '#F44336', 
  },
  statusButtonText: { color: COLORS.textPrimary, fontWeight: '600' },
  statusTextActive: { fontWeight: 'bold' },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
    marginTop: 10,
  },
  monthText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  todayButtonText: { color: COLORS.white, fontWeight: 'bold' },
  switchLabel: { fontSize: 14, color: COLORS.textSecondary },
  calendarWrapper: { marginHorizontal: 24, marginBottom: 20 },
  agendaTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: COLORS.textPrimary,
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 10
  },
  listContainer: { paddingBottom: 50, paddingHorizontal: 24 },
  agendaItemWrapper: { 
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.card,
      paddingBottom: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
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
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  startWalkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  startWalkButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // NOVOS ESTILOS PARA O BOTÃO DE FINALIZAR
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C853', // Verde vibrante
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  finishButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});