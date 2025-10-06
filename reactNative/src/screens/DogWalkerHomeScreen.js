import React, { useState, useMemo, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Switch, 
  LayoutAnimation, UIManager, Platform 
} from 'react-native';
import { Calendar, CalendarList, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import AgendaItem from '../components/AgendaItem';
import { AuthContext } from '../context/AuthContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const allAppointments = {
  '2025-10-20': [{ id: '1', petName: 'Bolinha', time: '2:00pm - 4:00pm', price: 50.00 }],
  '2025-10-22': [
    { id: '2', petName: 'Rex', time: '9:00am - 10:00am', price: 35.00 },
    { id: '3', petName: 'Luna', time: '1:00pm - 2:00pm', price: 35.00 },
  ],
  '2025-11-05': [{ id: '4', petName: 'Max', time: '3:00pm - 3:30pm', price: 25.00 }],
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan.','Fev.','Mar','Abr','Mai','Jun','Jul.','Ago','Set.','Out.','Nov.','Dez.'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['D','S','T','Q','Q','S','S'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function DogWalkerHomeScreen() {
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isMonthView, setIsMonthView] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState('available');

  const appointmentsForDay = useMemo(() => allAppointments[selectedDate] || [], [selectedDate]);

  const daySummary = useMemo(() => {
    const totalAppointments = appointmentsForDay.length;
    const totalEarnings = appointmentsForDay.reduce((sum, app) => sum + app.price, 0);
    return { totalAppointments, totalEarnings };
  }, [appointmentsForDay]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [appointmentsForDay]);

  const markedDates = useMemo(() => ({
    [selectedDate]: { selected: true, selectedColor: COLORS.primary },
    ...Object.keys(allAppointments).reduce((acc, date) => {
      acc[date] = { ...acc[date], marked: true, dotColor: COLORS.primary };
      if (date === selectedDate) {
        acc[date].selected = true;
      }
      return acc;
    }, {})
  }), [selectedDate]);

  const calendarProps = {
    current: selectedDate,
    onDayPress: (day) => setSelectedDate(day.dateString),
    markedDates: markedDates,
    theme: calendarTheme,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.welcomeTitle}>Bem-vindo,</Text>
                <Text style={styles.welcomeName}>{user?.nome || '[Dogwalker]'}</Text>
              </View>
              <TouchableOpacity><Ionicons name="notifications-outline" size={24} color={COLORS.black} /></TouchableOpacity>
            </View>

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                Para hoje você tem <Text style={styles.summaryHighlight}>{daySummary.totalAppointments} passeios</Text>,
                totalizando <Text style={styles.summaryHighlight}>R$ {daySummary.totalEarnings.toFixed(2)}</Text>
              </Text>
            </View>

            <View style={styles.statusContainer}>
              <TouchableOpacity 
                style={[styles.statusButton, availabilityStatus === 'available' && styles.statusButtonActiveGreen]}
                onPress={() => setAvailabilityStatus('available')}
              >
                <Text style={[styles.statusButtonText, availabilityStatus === 'available' && styles.statusTextActive]}>Disponível</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.statusButton, availabilityStatus === 'unavailable' && styles.statusButtonActiveRed]}
                onPress={() => setAvailabilityStatus('unavailable')}
              >
                <Text style={[styles.statusButtonText, availabilityStatus === 'unavailable' && styles.statusTextActive]}>Indisponível</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarHeader}>
              <Text style={styles.monthText}>{new Date(selectedDate.replace(/-/g, '/')).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</Text>
              <View style={styles.switchContainer}>
                <TouchableOpacity onPress={() => setSelectedDate(getTodayDate())} style={styles.todayButton}>
                  <Text style={styles.todayButtonText}>Hoje</Text>
                </TouchableOpacity>
                <Text style={styles.switchLabel}>Mês</Text>
                <Switch
                  trackColor={{ false: '#C7C7CC', true: COLORS.primary }}
                  thumbColor={isMonthView ? COLORS.white : '#f4f3f4'}
                  onValueChange={() => setIsMonthView(previousState => !previousState)}
                  value={isMonthView}
                />
              </View>
            </View>

            <View style={styles.calendarWrapper}>
              {isMonthView ? <Calendar {...calendarProps} /> : <CalendarList horizontal pagingEnabled calendarHeight={80} renderHeader={() => <View />} {...calendarProps} />}
            </View>

            <Text style={styles.agendaTitle}>Agendamentos</Text>
          </>
        }
        data={appointmentsForDay}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AgendaItem appointment={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sunny-outline" size={64} color={COLORS.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>Dia livre pela frente!</Text>
            <Text style={styles.emptyText}>Parece que não há passeios agendados para este dia.</Text>
            {availabilityStatus !== 'available' && (
              <TouchableOpacity style={styles.emptyButton} onPress={() => setAvailabilityStatus('available')}>
                <Text style={styles.emptyButtonText}>Ficar Disponível</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const calendarTheme = {
  calendarBackground: COLORS.background,
  textSectionTitleColor: '#b6c1cd',
  selectedDayBackgroundColor: COLORS.primary,
  selectedDayTextColor: COLORS.white,
  todayTextColor: COLORS.primary,
  dayTextColor: '#2d4150',
  textDisabledColor: '#d9e1e8',
  arrowColor: COLORS.primary,
  monthTextColor: COLORS.primary,
  textMonthFontWeight: 'bold',
  textDayHeaderFontWeight: 'bold',
  textDayFontSize: 16,
  textMonthFontSize: 20,
  textDayHeaderFontSize: 14,
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, alignItems: 'center' },
  welcomeTitle: { fontSize: 24, color: COLORS.textSecondary },
  welcomeName: { fontSize: 32, fontWeight: 'bold', color: COLORS.textPrimary },
  summaryContainer: {
    paddingHorizontal: 24,
    marginVertical: 24,
  },
  summaryText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  summaryHighlight: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    marginHorizontal: 24,
    padding: 4,
    marginBottom: 24,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusButtonActiveGreen: {
    backgroundColor: '#2ECC71',
    shadowColor: '#2ECC71',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  statusButtonActiveRed: {
    backgroundColor: '#E74C3C',
    shadowColor: '#E74C3C',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  statusButtonText: {
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  statusTextActive: {
    color: COLORS.white,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  todayButton: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 16,
  },
  todayButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  calendarWrapper: {
    marginBottom: 24,
  },
  agendaTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, paddingHorizontal: 24, marginBottom: 16 },
  listContainer: { paddingHorizontal: 24 },
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptyText: { 
    fontSize: 16, 
    color: COLORS.textSecondary, 
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});