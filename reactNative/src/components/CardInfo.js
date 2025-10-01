import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // 1. Importar o LinearGradient
import { COLORS } from '../theme/colors'; // Assumindo que você tem o arquivo de cores

// Dados de exemplo para um pet - substitua pelos dados reais da sua API
const defaultPet = {
  name: 'Rex',
  imageUri: 'https://i.pinimg.com/736x/a7/d7/7b/a7d77b1923945a2a2b9758b09f5b6b1b.jpg',
  walkInfo: {
    distance: '1.2',
    time: '30',
  }
};

// 2. O componente agora aceita um 'pet' como propriedade
export default function CardInfo({ pet = defaultPet }) {
  return (
    // 3. Usamos o LinearGradient como o container do card
    <LinearGradient
      colors={[COLORS.primary, '#E56A20']} // Gradiente da cor primária para um tom mais escuro
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: pet.imageUri }}
          style={styles.petImage}
        />
        <Text style={styles.petName}>{pet.name}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoBlock}>
          <Ionicons name="walk" size={24} color={COLORS.white} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoValue}>{pet.walkInfo.distance}</Text>
            <Text style={styles.infoUnit}>km</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoBlock}>
          <Ionicons name="timer-outline" size={24} color={COLORS.white} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoValue}>{pet.walkInfo.time}</Text>
            <Text style={styles.infoUnit}>min</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20, // Cantos mais arredondados
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    // Sombras suaves
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    ...Platform.select({
      web: {
        boxShadow: `0px 8px 24px ${COLORS.primary}4D`, // Cor primária com 30% de opacidade
      }
    }),
  },
  imageContainer: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.sm,
    borderWidth: 3, // Borda para destacar a imagem
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  petName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline', // Alinha a base do número e da unidade
    marginTop: spacing.sm,
  },
  infoValue: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  infoUnit: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    opacity: 0.9,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});