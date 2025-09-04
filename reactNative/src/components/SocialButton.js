import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function SocialButton({ type, onPress }) {
  const icons = {
   //  google: require("../../assets/google.png"),
 //   facebook: require("../../assets/facebook.png"), 
    apple: <FontAwesome name="apple" size={24} color="#000" />,
  };

  return (
    <TouchableOpacity style={styles.socialButton} onPress={onPress}>
      {type === "apple" ? icons.apple : <Image source={icons[type]} style={styles.socialIcon} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  socialIcon: { width: 24, height: 24 },
});
