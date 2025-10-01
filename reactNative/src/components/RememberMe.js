import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

// O componente agora é controlado por props
export default function RememberMe({ value, onValueChange, label = "Lembrar de mim" }) {
  const progress = useSharedValue(0);

  // Animação que dispara quando a prop 'value' (marcado/desmarcado) muda
  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [value, progress]);

  // Estilo animado que aplica escala e rotação ao ícone
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: progress.value },
        { rotate: `${progress.value * 10}deg` },
      ],
      opacity: progress.value,
    };
  });

  const checkboxStyle = [
    styles.checkbox,
    value && styles.checkboxChecked, // Aplica estilo de 'marcado'
  ];

  return (
    // O Pressable agora cobre toda a área para facilitar o toque
    <Pressable style={styles.container} onPress={() => onValueChange(!value)}>
      <View style={checkboxStyle}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <Ionicons name="checkmark" size={16} color={COLORS.white} />
        </Animated.View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const spacing = {
  sm: 8,
  md: 16,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6, // Cantos levemente arredondados
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
});