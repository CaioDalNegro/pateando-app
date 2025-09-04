import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function RadioButton({ label, selected, onPress }) {
  return (
    <TouchableOpacity style={styles.radioOption} onPress={onPress}>
      <View style={[styles.radioCircle, selected && styles.radioSelected]} />
      <Text style={styles.radioText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  radioOption: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#999",
    marginRight: 10,
  },
  radioSelected: { backgroundColor: "#FF7A2D", borderColor: "#FF7A2D" },
  radioText: { fontSize: 16, color: "#333" },
});
