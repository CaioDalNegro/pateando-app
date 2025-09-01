// src/components/NavButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NavButton({ text, icon, onPress }) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Ionicons name={icon} size={24} color="#FF7A2D" />
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: { backgroundColor: '#fff', width: 100, height: 100, borderRadius: 15, justifyContent: 'center', alignItems: 'center', padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    buttonText: { marginTop: 5, fontSize: 14, fontWeight: 'bold', color: '#FF7A2D', textAlign: 'center' },
});