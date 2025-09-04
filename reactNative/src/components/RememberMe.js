import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RememberMe() {
  return (
    <View style={styles.rememberMe}>
      <View style={styles.checkbox} />
      <Text style={styles.rememberText}>Remember me</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rememberMe: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: "#FF7A2D",
    marginRight: 8,
    backgroundColor: "#FF7A2D", // já marcado
  },
  rememberText: { fontSize: 14, color: "#444" },
});
