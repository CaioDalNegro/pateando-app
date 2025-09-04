import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DogwalkerItem({ name }) {
    return (
        <View style={styles.itemContainer}>
            <View style={styles.profileSection}>
                <Ionicons name="person-circle-outline" size={40} color="#ccc" />
                <Text style={styles.dogwalkerName}>{name}</Text>
            </View>
            <TouchableOpacity style={styles.openButton}>
                <Text style={styles.openButtonText}>Open</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    itemContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    profileSection: { flexDirection: 'row', alignItems: 'center' },
    dogwalkerName: { marginLeft: 10, fontSize: 16, color: '#333' },
    openButton: { backgroundColor: '#FF7A2D', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8 },
    openButtonText: { color: '#fff', fontWeight: 'bold' },
});