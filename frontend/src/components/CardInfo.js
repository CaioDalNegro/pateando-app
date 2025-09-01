
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CardInfo() {
    return (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/100' }}
                    style={styles.petImage}
                />
                <Text style={styles.petName}>[Nome do pet]</Text>
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <Ionicons name="walk" size={20} color="#FF7A2D" />
                    <Text style={styles.infoText}>1 km</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="timer-outline" size={20} color="#FF7A2D" />
                    <Text style={styles.infoText}>30 min</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#FF7A2D', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center' },
    imageContainer: { alignItems: 'center', marginRight: 20 },
    petImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 5 },
    petName: { color: '#fff', fontSize: 14 },
    infoContainer: { flex: 1, justifyContent: 'center' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    infoText: { color: '#fff', marginLeft: 10, fontSize: 16 },
});