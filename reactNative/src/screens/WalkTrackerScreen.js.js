import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.05; 
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Ponto de partida em São Carlos
const initialRegion = {
  latitude: -22.0177,
  longitude: -47.8908,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

// Constantes da simulação
const STEP_INTERVAL_MS = 2000; // 2 segundos por passo
const ESTIMATED_SPEED_KMH = 4; // Velocidade de caminhada estimada (4 km/h)
const TIME_PER_STEP_S = STEP_INTERVAL_MS / 1000;

/**
 * Funções auxiliares de cálculo (simplificadas para o mapa)
 */
const toRad = (value) => (value * Math.PI) / 180;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em km
};


/**
 * Gera um "passeio aleatório" de coordenadas
 */
const generateRandomWalk = (startLat, startLon, steps = 60, stepDistance = 0.0012) => {
  const path = [{ latitude: startLat, longitude: startLon }];
  let currentLat = startLat;
  let currentLon = startLon;
  let totalDistance = 0;

  for (let i = 1; i < steps; i++) {
    const latChange = (Math.random() - 0.5) * stepDistance * 2;
    const lonChange = (Math.random() - 0.5) * stepDistance * 2;
    
    const newLat = currentLat + latChange;
    const newLon = currentLon + lonChange;

    // Calcula a distância do último passo (para estimar o total)
    totalDistance += calculateDistance(currentLat, currentLon, newLat, newLon);

    currentLat = newLat;
    currentLon = newLon;

    path.push({ latitude: currentLat, longitude: currentLon });
  }
  return { path, totalDistance };
};

// Hook customizado para gerir a simulação
const useWalkSimulation = () => {
  const [currentCoord, setCurrentCoord] = useState(null);
  const [pathToShow, setPathToShow] = useState([]);
  const [fullPath, setFullPath] = useState([]);
  
  // NOVO: Estado para rastrear dados do passeio
  const [walkStats, setWalkStats] = useState({
    timeElapsed: 0, // em segundos
    distanceCovered: 0, // em km
    isFinished: false,
  });
  
  const index = useRef(0);
  const interval = useRef(null);
  const fullPathDetails = useRef({ path: [], totalDistance: 0 });

  useEffect(() => {
    // Gera um trajeto aleatório com range maior
    const details = generateRandomWalk(initialRegion.latitude, initialRegion.longitude, 60, 0.0012);
    fullPathDetails.current = details;
    
    setFullPath(details.path); 
    setCurrentCoord(details.path[0]); 

    // Inicia a simulação
    interval.current = setInterval(() => {
      index.current += 1;
      
      if (index.current < details.path.length) {
        const newCoord = details.path[index.current];
        const prevCoord = details.path[index.current - 1];
        
        // Calcula a distância percorrida no último passo
        const stepDistance = calculateDistance(prevCoord.latitude, prevCoord.longitude, newCoord.latitude, newCoord.longitude);

        setCurrentCoord(newCoord);
        setPathToShow(prevPath => [...prevPath, newCoord]);
        
        // Atualiza as estatísticas
        setWalkStats(prevStats => ({
          ...prevStats,
          timeElapsed: prevStats.timeElapsed + TIME_PER_STEP_S,
          distanceCovered: prevStats.distanceCovered + stepDistance,
        }));
        
      } else {
        // FIM DA SIMULAÇÃO
        clearInterval(interval.current);
        setWalkStats(prevStats => ({ ...prevStats, isFinished: true }));
      }
    }, STEP_INTERVAL_MS); 

    return () => clearInterval(interval.current);
  }, []);

  return { currentCoord, pathToShow, fullPath, walkStats };
};

const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes} min ${seconds} seg`;
};

export default function WalkTrackerScreen({ navigation }) {
  const mapRef = useRef(null);
  
  // NOVO: Puxando o walkStats do hook
  const { currentCoord, pathToShow, fullPath, walkStats } = useWalkSimulation();

  useEffect(() => {
    // Anima a câmera do mapa para seguir o pino
    if (currentCoord && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentCoord,
        latitudeDelta: LATITUDE_DELTA / 2, // Mais zoom
        longitudeDelta: LONGITUDE_DELTA / 2,
      }, 1000);
    }
  }, [currentCoord]);

  // Define a cor do status do passeio
  const statusColor = walkStats.isFinished ? '#2ECC71' : COLORS.textPrimary;
  const statusText = walkStats.isFinished ? 'Passeio Finalizado!' : 'Passeio em andamento...';

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
            {/* Polilinha cinzenta para o trajeto completo */}
            <Polyline
              coordinates={fullPath}
              strokeColor="rgba(0,0,0,0.3)"
              strokeWidth={5}
              lineDashPattern={[5, 10]}
            />
            {/* Polilinha laranja para o trajeto percorrido */}
            <Polyline
              coordinates={pathToShow}
              strokeColor={COLORS.primary}
              strokeWidth={6}
            />
            {/* Pino de Partida */}
            <Marker
              coordinate={fullPath[0]}
              title="Ponto de Partida"
              pinColor="#2ECC71" // Verde
            />
            {/* Pino do Dog Walker (só renderiza se tiver a coordenada) */}
            {currentCoord && (
              <Marker.Animated
                coordinate={currentCoord}
                anchor={{ x: 0.5, y: 0.5 }} // Centraliza a imagem
              >
                <View style={styles.walkerPin}>
                  <Ionicons name="paw" size={18} color={COLORS.white} />
                </View>
              </Marker.Animated>
            )}
            {/* Pino de Chegada (Aparece apenas quando finalizado) */}
            {walkStats.isFinished && fullPath.length > 0 && (
                 <Marker
                   coordinate={fullPath[fullPath.length - 1]}
                   title="Ponto de Chegada"
                   pinColor="#D32F2F" // Vermelho
                 />
            )}
          </>
        )}
      </MapView>

      {/* Painel Superior (Header) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acompanhando o Passeio</Text>
        <View style={{width: 40}} />
      </View>

      {/* Painel Inferior (Status) */}
      <View style={styles.bottomPanel}>
        <View style={styles.walkerInfo}>
          <View style={styles.walkerImage} />
          <View>
            <Text style={styles.walkerName}>[Nome do Dogwalker]</Text>
            {/* NOVO: Status dinâmico */}
            <Text style={[styles.walkerStatus, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            {/* NOVO: Valor de tempo dinâmico */}
            <Text style={styles.statValue}>{formatTime(walkStats.timeElapsed)}</Text>
            <Text style={styles.statLabel}>Tempo</Text>
          </View>
          <View style={styles.statBox}>
            {/* NOVO: Valor de distância dinâmico */}
            <Text style={styles.statValue}>{walkStats.distanceCovered.toFixed(2)} km</Text>
            <Text style={styles.statLabel}>Distância</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="call-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.stopButton} disabled={walkStats.isFinished}>
            <Text style={styles.stopButtonText}>
              {walkStats.isFinished ? 'Passeio Concluído' : 'Parada de Emergência'}
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
    left: 20,
    right: 20,
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
    shadowOffset: { width: 0, height: 2 },
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
    padding: 24,
    paddingBottom: Platform.OS === 'android' ? 24 : 34,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  walkerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  walkerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.card,
    marginRight: 16,
  },
  walkerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  walkerStatus: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 16,
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#FFEBEE', // Vermelho claro
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#D32F2F', // Vermelho escuro
    fontSize: 16,
    fontWeight: 'bold',
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
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
});