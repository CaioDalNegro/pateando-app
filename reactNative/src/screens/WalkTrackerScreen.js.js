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

/**
 * Gera um "passeio aleatório" de coordenadas
 */
const generateRandomWalk = (startLat, startLon, steps = 60, stepDistance = 0.0012) => {
  const path = [{ latitude: startLat, longitude: startLon }];
  let currentLat = startLat;
  let currentLon = startLon;

  for (let i = 1; i < steps; i++) {
    const latChange = (Math.random() - 0.5) * stepDistance * 2;
    const lonChange = (Math.random() - 0.5) * stepDistance * 2;

    currentLat += latChange;
    currentLon += lonChange;

    path.push({ latitude: currentLat, longitude: currentLon });
  }
  return path;
};

// Hook customizado para gerir a simulação
const useWalkSimulation = () => {
  const [currentCoord, setCurrentCoord] = useState(null);
  const [pathToShow, setPathToShow] = useState([]);
  const [fullPath, setFullPath] = useState([]);
  const index = useRef(0);
  const interval = useRef(null);

  useEffect(() => {
    // Gera um trajeto aleatório com range maior
    const newPath = generateRandomWalk(initialRegion.latitude, initialRegion.longitude, 60, 0.0012);
    setFullPath(newPath); 
    setCurrentCoord(newPath[0]); 

    // Inicia a simulação
    interval.current = setInterval(() => {
      if (index.current < newPath.length - 1) {
        index.current += 1;
        setCurrentCoord(newPath[index.current]);
        setPathToShow(newPath.slice(0, index.current + 1));
      } else {
        clearInterval(interval.current);
      }
    }, 2000); // A cada 2 segundos

    return () => clearInterval(interval.current);
  }, []);

  return { currentCoord, pathToShow, fullPath };
};

export default function WalkTrackerScreen({ navigation }) {
  const mapRef = useRef(null);
  
  const { currentCoord, pathToShow, fullPath } = useWalkSimulation();

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
            <Text style={styles.walkerStatus}>Passeio em andamento...</Text>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>15 min</Text>
            <Text style={styles.statLabel}>Tempo</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0.8 km</Text>
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
          <TouchableOpacity style={styles.stopButton}>
            <Text style={styles.stopButtonText}>Parada de Emergência</Text>
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