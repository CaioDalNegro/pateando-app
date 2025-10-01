import React from "react";
import { Pressable, StyleSheet, Platform, View } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

// 1. Objeto de configuração para cada tipo de botão social.
//    Facilita a adição de novos botões no futuro!
const SOCIAL_CONFIG = {
  google: {
    iconName: "logo-google",
    IconComponent: Ionicons,
    color: "#DB4437",
  },
  facebook: {
    iconName: "logo-facebook",
    IconComponent: Ionicons,
    color: "#4267B2",
  },
  apple: {
    iconName: "apple",
    IconComponent: FontAwesome,
    color: COLORS.black,
  },
};

export default function SocialButton({ type, onPress }) {
  // Pega a configuração baseada no 'type' recebido
  const config = SOCIAL_CONFIG[type];

  // Se o tipo for inválido, não renderiza nada
  if (!config) {
    return null;
  }

  const { IconComponent, iconName, color } = config;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressablePressed,
      ]}
      onPress={onPress}
    >
      <IconComponent name={iconName} size={24} color={color} />
    </Pressable>
  );
}

const spacing = {
  md: 16,
};

const styles = StyleSheet.create({
  pressable: {
    width: 56, // Tamanho padronizado
    height: 56,
    borderRadius: spacing.md,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)', // Borda sutil
    // Sombra consistente
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 8px rgba(0,0,0,0.07)",
        transition: "transform 0.1s ease",
      },
    }),
  },
  pressablePressed: {
    transform: [{ scale: 0.95 }],
  },
});