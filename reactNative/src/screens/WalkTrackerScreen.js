import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, Platform, Dimensions, 
  TouchableOpacity, Alert, Linking, Image 
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Ponto de partida em São Carlos
const initialRegion = {
  latitude: -22.0177,
  longitude: -47.8908,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

// Constantes da simulação
const STEP_INTERVAL_MS = 2000;
const TIME_PER_STEP_S = STEP_INTERVAL_MS / 1000;

const toRad = (value) => (value * Math.PI) / 180;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const generateRandomWalk = (startLat, startLon, steps = 60, stepDistance = 0.0003) => {
  const path = [{ latitude: startLat, longitude: startLon }];
  let currentLat = startLat;
  let currentLon = startLon;

  for (let i = 1; i < steps; i++) {
    const latChange = (Math.random() - 0.5) * stepDistance * 2;
    const lonChange = (Math.random() - 0.5) * stepDistance * 2;
    currentLat = currentLat + latChange;
    currentLon = currentLon + lonChange;
    path.push({ latitude: currentLat, longitude: currentLon });
  }
  return path;
};

const useWalkSimulation = () => {
  const [currentCoord, setCurrentCoord] = useState(null);
  const [pathToShow, setPathToShow] = useState([]);
  const [fullPath, setFullPath] = useState([]);
  const [walkStats, setWalkStats] = useState({
    timeElapsed: 0,
    distanceCovered: 0,
    isFinished: false,
  });

  const index = useRef(0);
  const interval = useRef(null);

  useEffect(() => {
    const path = generateRandomWalk(initialRegion.latitude, initialRegion.longitude, 60, 0.0003);
    setFullPath(path);
    setCurrentCoord(path[0]);

    interval.current = setInterval(() => {
      index.current += 1;

      if (index.current < path.length) {
        const newCoord = path[index.current];
        const prevCoord = path[index.current - 1];
        const stepDistance = calculateDistance(
          prevCoord.latitude, prevCoord.longitude,
          newCoord.latitude, newCoord.longitude
        );

        setCurrentCoord(newCoord);
        setPathToShow(prev => [...prev, newCoord]);
        setWalkStats(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + TIME_PER_STEP_S,
          distanceCovered: prev.distanceCovered + stepDistance,
        }));
      } else {
        clearInterval(interval.current);
        setWalkStats(prev => ({ ...prev, isFinished: true }));
      }
    }, STEP_INTERVAL_MS);

    return () => clearInterval(interval.current);
  }, []);

  return { currentCoord, pathToShow, fullPath, walkStats };
};

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${seconds}s`;
};

export default function WalkTrackerScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const mapRef = useRef(null);
  const { currentCoord, pathToShow, fullPath, walkStats } = useWalkSimulation();

  // ✅ Receber dados do passeio via route.params
  const walkData = route.params?.walkData || {};
  const {
    id: agendamentoId,
    name: petNames = 'Pet',
    petsCount = 1,
    dogwalkerName = 'Dogwalker',
    dogwalkerPhone = null,
    imageUri,
  } = walkData;

  useEffect(() => {
    if (currentCoord && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentCoord,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 1000);
    }
  }, [currentCoord]);

  // ✅ Função para ligar para o dogwalker
  const handleCall = () => {
    if (dogwalkerPhone) {
      Linking.openURL(`tel:${dogwalkerPhone}`);
    } else {
      Alert.alert(
        'Telefone indisponível',
        'O número do dogwalker não está disponível no momento.',
        [{ text: 'OK' }]
      );
    }
  };

  // ✅ Função para abrir chat
  const handleChat = () => {
    navigation.navigate('Chat', {
      agendamentoId,
      dogwalkerName,
      petNames,
      dogwalkerPhone,
    });
  };

  // ✅ Função de parada de emergência
  const handleEmergencyStop = () => {
    Alert.alert(
      '🚨 Parada de Emergência',
      'Tem certeza que deseja solicitar a parada imediata do passeio? O dogwalker será notificado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, Parar Agora',
          style: 'destructive',
          onPress: async () => {
            try {
              // Chamar API de emergência
              await api.put(`/agendamentos/${agendamentoId}/emergencia`, {
                clienteId: user.id
              });
              
              Alert.alert(
                'Solicitação Enviada',
                'O dogwalker foi notificado e irá encerrar o passeio o mais rápido possível. Você receberá uma atualização em breve.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Erro ao solicitar emergência:', error);
              Alert.alert(
                'Erro', 
                error.response?.data || 'Não foi possível enviar a solicitação. Tente ligar para o dogwalker.'
              );
            }
          },
        },
      ]
    );
  };

  const statusColor = walkStats.isFinished ? '#4CAF50' : COLORS.primary;
  const statusText = walkStats.isFinished ? 'Passeio Finalizado!' : 'Em andamento...';

  return (
    <SafeAreaView style={styles.safeArea}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        initialRegion={initialRegion}
        showsUserLocation
      >
        {fullPath.length > 0 && (
          <>
            <Polyline
              coordinates={fullPath}
              strokeColor="rgba(0,0,0,0.2)"
              strokeWidth={4}
              lineDashPattern={[5, 10]}
            />
            <Polyline
              coordinates={pathToShow}
              strokeColor={COLORS.primary}
              strokeWidth={5}
            />
            <Marker coordinate={fullPath[0]} title="Início" pinColor="#4CAF50" />
            {currentCoord && (
              <Marker.Animated coordinate={currentCoord} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.walkerPin}>
                  <Ionicons name="paw" size={16} color={COLORS.white} />
                </View>
              </Marker.Animated>
            )}
            {walkStats.isFinished && fullPath.length > 0 && (
              <Marker coordinate={fullPath[fullPath.length - 1]} title="Fim" pinColor="#F44336" />
            )}
          </>
        )}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acompanhar Passeio</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {/* Info do Dogwalker */}
        <View style={styles.walkerInfo}>
          <View style={styles.walkerImageContainer}>
            <Ionicons name="person" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.walkerDetails}>
            <Text style={styles.walkerName}>{dogwalkerName}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.walkerStatus, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>
        </View>

        {/* Info dos Pets */}
        <View style={styles.petsInfo}>
          <Ionicons name="paw" size={18} color={COLORS.textSecondary} />
          <Text style={styles.petsText}>
            {petsCount > 1 ? `${petsCount} pets: ` : ''}{petNames}
          </Text>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>{formatTime(walkStats.timeElapsed)}</Text>
            <Text style={styles.statLabel}>Tempo</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="walk-outline" size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>{walkStats.distanceCovered.toFixed(2)} km</Text>
            <Text style={styles.statLabel}>Distância</Text>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handleChat}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
            <Ionicons name="call-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.stopButton, walkStats.isFinished && styles.stopButtonDisabled]} 
            onPress={handleEmergencyStop}
            disabled={walkStats.isFinished}
          >
            <Ionicons 
              name={walkStats.isFinished ? "checkmark-circle" : "alert-circle"} 
              size={20} 
              color={walkStats.isFinished ? "#4CAF50" : "#D32F2F"} 
            />
            <Text style={[styles.stopButtonText, walkStats.isFinished && styles.stopButtonTextFinished]}>
              {walkStats.isFinished ? 'Concluído' : 'Parada de Emergência'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 24 : 34,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  walkerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walkerImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 122, 45, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  walkerDetails: {
    flex: 1,
  },
  walkerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  walkerStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  petsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  petsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.card,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stopButtonDisabled: {
    backgroundColor: '#E8F5E9',
  },
  stopButtonText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stopButtonTextFinished: {
    color: '#4CAF50',
  },
  walkerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.white,
    borderWidth: 3,
    elevation: 5,
  },
});