import React, { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { 
  View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert, Dimensions, Platform, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { COLORS } from '../theme/colors';
import { AuthContext } from '../context/AuthContext'; 
import api from '../services/api';

const MapView = Platform.OS === 'web' ? null : lazy(() => import('react-native-maps'));

const { width, height } = Dimensions.get('window');

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const basicPlanDurations = [
  { id: 'd1', duration: '30 min', minutes: 30, price: 25 },
  { id: 'd2', duration: '60 min', minutes: 60, price: 40 },
  { id: 'd3', duration: '90 min', minutes: 90, price: 55 },
];

const availableTimeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// Constante para máximo de pets
const MAX_PETS = 3;

export default function AgendaScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [location, setLocation] = useState(null);
  
  const [userPets, setUserPets] = useState([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  
  // ✅ MUDANÇA: Array de IDs selecionados (múltipla seleção)
  const [selectedPetIds, setSelectedPetIds] = useState([]); 
  const [selectedDurationId, setSelectedDurationId] = useState(basicPlanDurations[0]?.id);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(availableTimeSlots[0]);

  useEffect(() => {
    fetchUserPets();
  }, [user]);

  const fetchUserPets = async () => {
    if (!user?.id) return;
    try {
      setIsLoadingPets(true);
      const response = await api.get(`/pets/user/${user.id}`);
      setUserPets(response.data);
      // Selecionar o primeiro pet por padrão
      if (response.data.length > 0) {
        setSelectedPetIds([response.data[0].id]);
      }
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus pets.');
    } finally {
      setIsLoadingPets(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        setLocation({ latitude: -22.0177, longitude: -47.8908 });
        return;
      }
      const permissionResult = await Location.requestForegroundPermissionsAsync();
      if (!permissionResult || permissionResult.status !== 'granted') {
        setLocation({ latitude: -22.0177, longitude: -47.8908 }); 
        return;
      }
      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (error) {
         setLocation({ latitude: -22.0177, longitude: -47.8908 });
      }
    })();
  }, []);

  // ✅ Função para toggle de seleção de pet
  const togglePetSelection = (petId) => {
    setSelectedPetIds(prev => {
      if (prev.includes(petId)) {
        // Remover (mas não permitir ficar vazio)
        if (prev.length === 1) {
          Alert.alert('Atenção', 'Selecione pelo menos 1 pet para o passeio.');
          return prev;
        }
        return prev.filter(id => id !== petId);
      } else {
        // Adicionar (máximo 3)
        if (prev.length >= MAX_PETS) {
          Alert.alert('Limite atingido', `Máximo de ${MAX_PETS} pets por passeio.`);
          return prev;
        }
        return [...prev, petId];
      }
    });
  };

  // ✅ Calcular preço total (base + adicional por pet extra)
  const calculateTotalPrice = () => {
    const selectedDuration = basicPlanDurations.find(d => d.id === selectedDurationId);
    const basePrice = selectedDuration?.price || 25;
    const extraPets = selectedPetIds.length - 1;
    const extraPrice = extraPets * 10; // R$10 por pet adicional
    return basePrice + extraPrice;
  };

  const handleContinue = () => {
    if (selectedPetIds.length === 0) { 
      Alert.alert("Selecione um Pet", "Por favor, escolha pelo menos um pet para passear."); 
      return; 
    }
    
    // Pega os dados selecionados
    const selectedPets = userPets.filter(p => selectedPetIds.includes(p.id));
    const selectedDuration = basicPlanDurations.find(d => d.id === selectedDurationId);
    
    // Monta a data/hora (correção de timezone)
    const [year, month, day] = selectedDate.split('-').map(Number);
    const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
    const dateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

    // Navega para SelectDogWalker passando os dados
    navigation.navigate('SelectDogWalker', {
      petIds: selectedPetIds,
      petNames: selectedPets.map(p => p.nome).join(', '),
      petsCount: selectedPetIds.length,
      durationId: selectedDurationId,
      durationMinutes: selectedDuration?.minutes,
      price: `R$ ${calculateTotalPrice()}`,
      totalPrice: calculateTotalPrice(),
      dateTime: dateTime.toISOString(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mapContainer}>
        {MapView && location ? (
          <Suspense fallback={<ActivityIndicator size="large" color={COLORS.primary} style={StyleSheet.absoluteFill} />}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              provider="google" 
              showsUserLocation={true} 
            />
          </Suspense>
        ) : (
          <View style={styles.mapPlaceholder}>
             <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.handleBar} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* ✅ Seção de Pets com seleção múltipla */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. Quais pets vão passear?</Text>
            <Text style={styles.sectionSubtitle}>
              {selectedPetIds.length}/{MAX_PETS} selecionados
            </Text>
          </View>
          
          {isLoadingPets ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
          ) : userPets.length === 0 ? (
            <View style={styles.noPetsContainer}>
              <Text style={styles.noPetsText}>Você ainda não tem pets cadastrados.</Text>
              <TouchableOpacity style={styles.addFirstPetButton} onPress={() => navigation.navigate('RegisterPetClient')}>
                <Ionicons name="add-circle" size={24} color={COLORS.white} />
                <Text style={styles.addFirstPetText}>Cadastrar meu primeiro pet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
              {userPets.map(pet => {
                const isSelected = selectedPetIds.includes(pet.id);
                return (
                  <TouchableOpacity 
                    key={pet.id} 
                    style={[styles.petCard, isSelected && styles.petCardSelected]}
                    onPress={() => togglePetSelection(pet.id)}
                  >
                    {/* Indicador de seleção */}
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={14} color={COLORS.white} />
                      </View>
                    )}
                    <Image 
                      source={{ uri: pet.fotoUrl || 'https://via.placeholder.com/60/FFEBD0/FF7A2D?text=Pet' }} 
                      style={styles.petImage} 
                    />
                    <Text style={[styles.petName, isSelected && styles.petNameSelected]}>
                      {pet.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.addPetCard} onPress={() => navigation.navigate('RegisterPetClient')}>
                <Ionicons name="add" size={24} color={COLORS.primary} />
                <Text style={styles.addPetText}>Adicionar</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Info de preço por pet adicional */}
          {selectedPetIds.length > 1 && (
            <View style={styles.extraPetInfo}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.extraPetText}>
                +R$10 por pet adicional ({selectedPetIds.length - 1} extra{selectedPetIds.length > 2 ? 's' : ''})
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>2. Escolha a duração</Text>
          <View style={styles.durationContainer}>
            {basicPlanDurations.map(option => (
               <TouchableOpacity 
                  key={option.id} 
                  style={[styles.durationCard, selectedDurationId === option.id && styles.durationCardSelected]}
                  onPress={() => setSelectedDurationId(option.id)}
               >
                  <Text style={[styles.durationText, selectedDurationId === option.id && styles.durationTextSelected]}>{option.duration}</Text>
                  <Text style={[styles.priceText, selectedDurationId === option.id && styles.priceTextSelected]}>R$ {option.price}</Text>
               </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>3. Escolha a data</Text>
          <Calendar
            style={styles.calendar}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{ [selectedDate]: { selected: true, selectedColor: COLORS.primary } }}
            minDate={getTodayDateString()}
            theme={{
              calendarBackground: COLORS.white,
              arrowColor: COLORS.primary,
              todayTextColor: COLORS.primary,
              textDayFontWeight: '600',
              textMonthFontWeight: 'bold',
              monthTextColor: COLORS.textPrimary,
              textDayHeaderFontWeight: 'bold',
            }}
          />

          <Text style={styles.sectionTitle}>4. Escolha o horário</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availableTimeSlots.map(time => (
              <TouchableOpacity
                key={time}
                style={[styles.timeSlotButton, selectedTimeSlot === time && styles.timeSlotSelected]}
                onPress={() => setSelectedTimeSlot(time)}
              >
                <Text style={[styles.timeSlotText, selectedTimeSlot === time && styles.timeSlotTextSelected]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </ScrollView>
        
        {/* ✅ Botão com preço total */}
        <View style={styles.continueButtonContainer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>R$ {calculateTotalPrice()}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.continueButton, userPets.length === 0 && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={userPets.length === 0}
          >
            <Text style={styles.continueButtonText}>Escolher Dog Walker</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  mapContainer: { flex: 1, backgroundColor: '#E0E0E0' },
  map: { ...StyleSheet.absoluteFillObject },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0E0E0' },
  backButton: { position: 'absolute', top: Platform.OS === 'android' ? 40 : 50, left: 24, backgroundColor: COLORS.white, padding: 8, borderRadius: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  bottomSheet: { flex: 1.5, backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 12, marginTop: -20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1 },
  handleBar: { width: 50, height: 5, backgroundColor: COLORS.card, borderRadius: 3, alignSelf: 'center', marginBottom: 16 },
  scrollContent: { paddingBottom: 120 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16, marginTop: 24 },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  petSelector: { marginBottom: 16 },
  petCard: { 
    backgroundColor: COLORS.background, 
    borderRadius: 12, 
    padding: 12, 
    alignItems: 'center', 
    marginRight: 16, 
    borderWidth: 2, 
    borderColor: 'transparent',
    position: 'relative',
  },
  petCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.white, elevation: 3 },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  petImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, backgroundColor: COLORS.card },
  petName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  petNameSelected: { color: COLORS.primary },
  addPetCard: { width: 84, height: 112, backgroundColor: COLORS.background, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.card, borderStyle: 'dashed' },
  addPetText: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginTop: 4 },
  extraPetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 122, 45, 0.1)',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 8,
  },
  extraPetText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  durationContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  durationCard: { flex: 1, backgroundColor: COLORS.background, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  durationCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.white, elevation: 3 },
  durationText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  durationTextSelected: { color: COLORS.primary },
  priceText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  priceTextSelected: { color: COLORS.primary, fontWeight: '500' },
  calendar: { borderRadius: 12, borderWidth: 1, borderColor: COLORS.card },
  timeSlotButton: { backgroundColor: COLORS.background, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, marginRight: 12, borderWidth: 2, borderColor: 'transparent' },
  timeSlotSelected: { backgroundColor: COLORS.white, borderColor: COLORS.primary, elevation: 3 },
  timeSlotText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  timeSlotTextSelected: { color: COLORS.primary },
  continueButtonContainer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 24, 
    paddingTop: 12, 
    backgroundColor: COLORS.white, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.card,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  continueButton: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  continueButtonDisabled: { backgroundColor: COLORS.textSecondary, shadowOpacity: 0, elevation: 0 },
  continueButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  noPetsContainer: { alignItems: 'center', paddingVertical: 24 },
  noPetsText: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  addFirstPetButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8 },
  addFirstPetText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
});