import React, { useState, useEffect, useContext, lazy, Suspense } from 'react'; // Adicionado lazy e Suspense
import { 
  View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert, Dimensions, Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// REMOVIDO: import MapView from 'react-native-maps'; 
import * as Location from 'expo-location';
import { COLORS } from '../theme/colors';
import { AuthContext } from '../context/AuthContext'; 

// NOVO: Importa o MapView apenas se NÃO for web, usando lazy loading
const MapView = Platform.OS === 'web' ? null : lazy(() => import('react-native-maps'));

const { width, height } = Dimensions.get('window');

const userPets = [
  { id: 'p1', name: 'Bolinha', imageUri: 'https://i.pinimg.com/736x/a7/d7/7b/a7d77b1923945a2a2b9758b09f5b6b1b.jpg' },
  { id: 'p2', name: 'Rex', imageUri: 'https://placehold.co/60x60/FFEBD0/FF7A2D?text=Pet' }, 
];

const basicPlanDurations = [
  { id: 'd1', duration: '30 min', price: 'R$ 25' },
  { id: 'd2', duration: '60 min', price: 'R$ 40' },
  { id: 'd3', duration: '90 min', price: 'R$ 55' },
];

export default function AgendaScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(userPets[0]?.id); 
  const [selectedDurationId, setSelectedDurationId] = useState(basicPlanDurations[0]?.id);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setLocation({ latitude: -22.0177, longitude: -47.8908 }); 
      return;
    }

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão para acessar a localização foi negada');
        Alert.alert("Permissão Necessária", "Precisamos da sua localização para mostrar o mapa e encontrar walkers próximos.");
        setLocation({ latitude: -22.0177, longitude: -47.8908 }); 
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (error) {
         setErrorMsg('Não foi possível obter a localização.');
         console.error("Erro ao obter localização:", error);
         setLocation({ latitude: -22.0177, longitude: -47.8908 }); 
      }
    })();
  }, []);

  const handleContinue = () => {
    if (!selectedPetId) {
      Alert.alert("Selecione um Pet", "Por favor, escolha qual pet irá passear.");
      return;
    }
    navigation.navigate('SelectDogWalker', { 
        petId: selectedPetId, 
        durationId: selectedDurationId,
     });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mapContainer}>
        {/* ALTERADO: Lógica de renderização condicional + Suspense */}
        {MapView && location ? (
          <Suspense fallback={<ActivityIndicator size="large" color={COLORS.primary} style={styles.mapLoading} />}>
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
                <Text style={styles.mapPlaceholderText}>Visualização do mapa indisponível na web.</Text>
            ) : (
                <ActivityIndicator size="large" color={COLORS.primary} />
            )}
          </View>
        )}
        <View style={styles.mapOverlay} />
      </View>

      <ScrollView 
         style={styles.contentOverlay}
         contentContainerStyle={styles.scrollContent}
         showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agendar Passeio</Text>
          <View style={{ width: 28 }} /> 
        </View>

        <Text style={styles.sectionTitle}>Qual pet vai passear?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
          {userPets.map(pet => (
            <TouchableOpacity 
              key={pet.id} 
              style={[styles.petCard, selectedPetId === pet.id && styles.petCardSelected]}
              onPress={() => setSelectedPetId(pet.id)}
            >
              <Image 
                source={{ uri: pet.imageUri }} 
                style={styles.petImage} 
                onError={(e) => console.log('Erro ao carregar imagem do pet:', e.nativeEvent.error)} 
              />
              <Text style={[styles.petName, selectedPetId === pet.id && styles.petNameSelected]}>{pet.name}</Text>
            </TouchableOpacity>
          ))}
           <TouchableOpacity style={styles.addPetCard} onPress={() => navigation.navigate('RegisterPetClient')}>
               <Ionicons name="add" size={24} color={COLORS.primary} />
               <Text style={styles.addPetText}>Adicionar</Text>
           </TouchableOpacity>
        </ScrollView>

        <Text style={styles.sectionTitle}>Escolha a duração (Plano Básico):</Text>
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

        <Text style={styles.sectionTitle}>Escolha a data e hora:</Text>
        <View style={styles.dateTimePlaceholder}>
          <Text style={styles.dateTimeText}>Seletor de Data/Hora (Em breve)</Text>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: {
    ...StyleSheet.absoluteFillObject, 
    zIndex: -1, 
    backgroundColor: '#A0A0A0', 
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', 
  },
  contentOverlay: {
     flex: 1,
  },
  scrollContent: {
     padding: 24,
     paddingTop: Platform.OS === 'android' ? 40 : 24, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
    marginTop: 24,
  },
  petSelector: {
     marginBottom: 16,
  },
  petCard: {
     backgroundColor: 'rgba(255,255,255,0.8)',
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
  },
  petImage: {
     width: 60,
     height: 60,
     borderRadius: 30,
     marginBottom: 8,
     backgroundColor: COLORS.card,
  },
  petName: {
     fontSize: 14,
     fontWeight: '600',
     color: COLORS.textPrimary,
  },
   petNameSelected: {
     color: COLORS.primary,
  },
   addPetCard: {
     width: 84,
     height: 112, 
     backgroundColor: 'rgba(255,255,255,0.8)',
     borderRadius: 12,
     justifyContent: 'center',
     alignItems: 'center',
   },
   addPetText: {
     fontSize: 14,
     fontWeight: '600',
     color: COLORS.primary,
     marginTop: 4,
   },
  durationContainer: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     gap: 16, 
  },
  durationCard: {
     flex: 1,
     backgroundColor: 'rgba(255,255,255,0.8)',
     borderRadius: 12,
     padding: 16,
     alignItems: 'center',
     borderWidth: 2,
     borderColor: 'transparent',
  },
  durationCardSelected: {
     borderColor: COLORS.primary,
     backgroundColor: COLORS.white,
  },
  durationText: {
     fontSize: 16,
     fontWeight: 'bold',
     color: COLORS.textPrimary,
  },
   durationTextSelected: {
     color: COLORS.primary,
  },
  priceText: {
     fontSize: 14,
     color: COLORS.textSecondary,
     marginTop: 4,
  },
   priceTextSelected: {
     color: COLORS.primary,
     fontWeight: '500',
  },
  dateTimePlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  dateTimeText: {
     fontSize: 16,
     color: COLORS.textSecondary,
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

