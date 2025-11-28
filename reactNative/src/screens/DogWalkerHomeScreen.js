import React, { useState, useMemo, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Switch, 
  LayoutAnimation, UIManager, Platform, Alert 
} from 'react-native';
import { Calendar, CalendarList, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../theme/colors';
import AgendaItem from '../components/AgendaItem';
import { AuthContext } from '../context/AuthContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

// Dados de agendamento mockados com um novo campo 'status'
const allAppointments = {
  [getTodayDate()]: [
    { id: '1', petName: 'Rex', time: '09:00 - 10:00', price: 35.00, status: 'active' }, 
    { id: '2', petName: 'Luna', time: '14:00 - 15:00', price: 35.00, status: 'scheduled' },
  ],
  '2025-10-06': [{ id: '3', petName: 'Bolinha', time: '14:00 - 16:00', price: 50.00, status: 'scheduled' }],
  '2025-10-08': [{ id: '4', petName: 'Max', time: '15:00 - 15:30', price: 25.00, status: 'scheduled' }],
};

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  dayNamesShort: ['D','S','T','Q','Q','S','S'],
};
LocaleConfig.defaultLocale = 'pt-br';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia,";
  if (hour < 18) return "Boa tarde,";
  return "Boa noite,";
};

export default function DogWalkerHomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isMonthView, setIsMonthView] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState('available');

  const appointmentsForDay = useMemo(() => {
    const appointments = allAppointments[selectedDate] || [];
    return appointments.sort((a, b) => parseInt(a.time.split(':')[0]) - parseInt(b.time.split(':')[0]));
  }, [selectedDate]);

  const daySummary = useMemo(() => {
    const totalAppointments = appointmentsForDay.length;
    const totalEarnings = appointmentsForDay.reduce((sum, app) => sum + app.price, 0);
    return { totalAppointments, totalEarnings };
  }, [appointmentsForDay]);
  
  const nextAppointmentId = useMemo(() => { /* ...lógica para achar o próximo... */ return null; });

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

  const handleStatusChange = (status) => {
    triggerHaptic();
    setAvailabilityStatus(status);
  };

  // 💥 NOVA FUNÇÃO: Navega para a tela de finalização de passeio
  const handleFinishWalk = (appointment) => {
    const mockWalkData = {
        petName: appointment.petName,
        duration: '45 minutos', // Mockado para simular o tempo real
        distance: '2.1 km', // Mockado para simular a distância real
        dogwalkerName: user?.nome || 'Dogwalker'
    };
    // Navega para a tela FinishWalk passando os dados
    navigation.navigate('FinishWalk', { walkData: mockWalkData });
  };


  const markedDates = useMemo(() => ({ /* ... */ }), [selectedDate]);
  const calendarProps = { current: selectedDate, onDayPress: handleDayPress, markedDates, theme: calendarTheme };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
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
                
                {/* 👇 NOVO: BOTÃO DE FINALIZAR SÓ APARECE PARA PASSEIOS ATIVOS */}
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
                <Ionicons name="sad-outline" size={30} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>Sem agendamentos neste dia.</Text>
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