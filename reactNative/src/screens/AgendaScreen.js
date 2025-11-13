import React, { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { 
  View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert, Dimensions, Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { COLORS } from '../theme/colors';
import { AuthContext } from '../context/AuthContext'; 

// Importa o MapView apenas se NÃO for web, usando lazy loading
const MapView = Platform.OS === 'web' ? null : lazy(() => import('react-native-maps'));

const { width, height } = Dimensions.get('window');

// Configuração do Calendário para Português
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  dayNamesShort: ['D','S','T','Q','Q','S','S'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

// Dados de exemplo
const userPets = [
  { id: 'p1', name: 'Bolinha', imageUri: 'https://i.pinimg.com/736x/a7/d7/7b/a7d77b1923945a2a2b9758b09f5b6b1b.jpg' },
  { id: 'p2', name: 'Rex', imageUri: 'https://placehold.co/60x60/FFEBD0/FF7A2D?text=Pet' }, 
];

const basicPlanDurations = [
  { id: 'd1', duration: '30 min', price: 'R$ 25' },
  { id: 'd2', duration: '60 min', price: 'R$ 40' },
  { id: 'd3', duration: '90 min', price: 'R$ 55' },
];

const availableTimeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export default function AgendaScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [location, setLocation] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(userPets[0]?.id); 
  const [selectedDurationId, setSelectedDurationId] = useState(basicPlanDurations[0]?.id);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(availableTimeSlots[0]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        setLocation({ latitude: -22.0177, longitude: -47.8908 }); // Localização padrão (São Carlos) para web
        return;
      }

      // --- CORREÇÃO APLICADA AQUI ---
      const permissionResult = await Location.requestForegroundPermissionsAsync();

      // 1. Verificamos se a biblioteca retornou algo
      if (!permissionResult) {
        console.error("A biblioteca de localização falhou (retornou undefined).");
        Alert.alert("Erro", "Não foi possível verificar a permissão de localização.");
        setLocation({ latitude: -22.0177, longitude: -47.8908 }); // Define localização padrão
        return;
      }
      
      // 2. Agora que sabemos que permissionResult existe, podemos desestruturar o status
      const { status } = permissionResult;
      
      if (status !== 'granted') {
        Alert.alert("Permissão Necessária", "Precisamos da sua localização para mostrar o mapa.");
        setLocation({ latitude: -22.0177, longitude: -47.8908 }); 
        return;
      }
      // --- FIM DA CORREÇÃO ---

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (error) {
         console.error("Erro ao obter localização:", error);
         setLocation({ latitude: -22.0177, longitude: -47.8908 }); // Localização padrão em caso de erro
      }
    })();
  }, []);

  const handleContinue = () => {
    if (!selectedPetId) { Alert.alert("Selecione um Pet", "Por favor, escolha qual pet irá passear."); return; }
    
    // Combina a data e a hora antes de enviar
    const [year, month, day] = selectedDate.split('-');
    const [hour, minute] = selectedTimeSlot.split(':');
    const finalDateTime = new Date(year, month - 1, day, hour, minute);

    navigation.navigate('SelectDogWalker', { 
        petId: selectedPetId, 
        durationId: selectedDurationId,
        dateTime: finalDateTime.toISOString(), // Envia a data completa
     });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Metade Superior: O Mapa */}
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
             {Platform.OS === 'web' ? (
                <Text style={styles.mapPlaceholderText}>Mapa indisponível na web.</Text>
             ) : (
                <ActivityIndicator size="large" color={COLORS.primary} />
             )}
          </View>
        )}
        
        {/* Botão de Voltar sobre o mapa */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Metade Inferior: O Painel de Opções */}
      <View style={styles.bottomSheet}>
        <View style={styles.handleBar} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.sectionTitle}>1. Qual pet vai passear?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
            {userPets.map(pet => (
              <TouchableOpacity 
                key={pet.id} 
                style={[styles.petCard, selectedPetId === pet.id && styles.petCardSelected]}
                onPress={() => setSelectedPetId(pet.id)}
              >
                <Image source={{ uri: pet.imageUri }} style={styles.petImage} />
                <Text style={[styles.petName, selectedPetId === pet.id && styles.petNameSelected]}>{pet.name}</Text>
              </TouchableOpacity>
            ))}
             <TouchableOpacity style={styles.addPetCard} onPress={() => navigation.navigate('RegisterPetClient')}>
                 <Ionicons name="add" size={24} color={COLORS.primary} />
                 <Text style={styles.addPetText}>Adicionar</Text>
             </TouchableOpacity>
          </ScrollView>

          <Text style={styles.sectionTitle}>2. Escolha a duração</Text>
          <View style={styles.durationContainer}>
            {basicPlanDurations.map(option => (
               <TouchableOpacity 
                  key={option.id} 
                  style={[styles.durationCard, selectedDurationId === option.id && styles.durationCardSelected]}
                  onPress={() => setSelectedDurationId(option.id)}
               >
                  <Text style={[styles.durationText, selectedDurationId === option.id && styles.durationTextSelected]}>{option.duration}</Text>
                  <Text style={[styles.priceText, selectedDurationId === option.id && styles.priceTextSelected]}>{option.price}</Text>
               </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>3. Escolha a data</Text>
          <Calendar
            style={styles.calendar}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: COLORS.primary }
            }}
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
                style={[
                  styles.timeSlotButton,
                  selectedTimeSlot === time && styles.timeSlotSelected
                ]}
                onPress={() => setSelectedTimeSlot(time)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTimeSlot === time && styles.timeSlotTextSelected
                ]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </ScrollView>
        
        {/* Botão de Continuar Fixo */}
        <View style={styles.continueButtonContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  // --- Mapa (Metade Superior) ---
  mapContainer: {
    flex: 1, // Ocupa a metade de cima
    backgroundColor: '#E0E0E0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  mapPlaceholderText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 50,
    left: 24,
    backgroundColor: COLORS.white,
    padding: 8,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  // --- Painel (Metade Inferior) ---
  bottomSheet: {
    flex: 1.5, // Ocupa mais espaço que o mapa
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    marginTop: -20, // Puxa o painel um pouco para cima do mapa
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  handleBar: {
    width: 50,
    height: 5,
    backgroundColor: COLORS.card,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  scrollContent: {
     paddingBottom: 100, // Espaço para o botão "Continuar" não flutuar por cima
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    marginTop: 24,
  },
  // --- Seletores (Pet, Duração, Hora) ---
  petSelector: { marginBottom: 16 },
  petCard: {
     backgroundColor: COLORS.background,
     borderRadius: 12,
     padding: 12,
     alignItems: 'center',
     marginRight: 16,
     borderWidth: 2,
     borderColor: 'transparent',
  },
  petCardSelected: {
     borderColor: COLORS.primary,
     backgroundColor: COLORS.white,
     elevation: 3,
  },
  petImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, backgroundColor: COLORS.card },
  petName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  petNameSelected: { color: COLORS.primary },
  addPetCard: {
     width: 84,
     height: 112, 
     backgroundColor: COLORS.background,
     borderRadius: 12,
     justifyContent: 'center',
     alignItems: 'center',
     borderWidth: 2,
     borderColor: COLORS.card,
     borderStyle: 'dashed',
   },
  addPetText: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginTop: 4 },
  durationContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  durationCard: {
     flex: 1,
     backgroundColor: COLORS.background,
     borderRadius: 12,
     padding: 16,
     alignItems: 'center',
     borderWidth: 2,
     borderColor: 'transparent',
  },
  durationCardSelected: {
     borderColor: COLORS.primary,
     backgroundColor: COLORS.white,
     elevation: 3,
  },
  durationText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  durationTextSelected: { color: COLORS.primary },
  priceText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  priceTextSelected: { color: COLORS.primary, fontWeight: '500' },
  // --- Calendário e Hora ---
  calendar: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.card,
  },
  timeSlotButton: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeSlotSelected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    elevation: 3,
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  timeSlotTextSelected: {
    color: COLORS.primary,
  },
  // --- Botão Fixo ---
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
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});