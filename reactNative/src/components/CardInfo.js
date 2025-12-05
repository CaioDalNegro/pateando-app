import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';

const defaultPet = {
  name: 'Rex',
  imageUri: 'https://i.pinimg.com/736x/a7/d7/7b/a7d77b1923945a2a2b9758b09f5b6b1b.jpg',
  walkInfo: {
    distance: '1.2',
    time: '30',
  },
  petsCount: 1,
};

export default function CardInfo({ pet = defaultPet }) {
  const petsCount = pet.petsCount || 1;

  return (
    <LinearGradient
      colors={[COLORS.primary, '#E56A20']}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: pet.imageUri }}
            style={styles.petImage}
          />
          {/* ✅ Badge para múltiplos pets */}
          {petsCount > 1 && (
            <View style={styles.petCountBadge}>
              <Ionicons name="paw" size={12} color={COLORS.white} />
              <Text style={styles.petCountText}>{petsCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.petName} numberOfLines={2}>{pet.name}</Text>
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
    borderRadius: 20,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    ...Platform.select({
      web: {
        boxShadow: `0px 8px 24px ${COLORS.primary}4D`,
      }
    }),
  },
  imageContainer: {
    alignItems: 'center',
    marginRight: spacing.lg,
    maxWidth: 100,
  },
  imageWrapper: {
    position: 'relative',
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  petCountBadge: {
    position: 'absolute',
    bottom: 4,
    right: -8,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  petCountText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  petName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
    textAlign: 'center',
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
    alignItems: 'baseline',
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