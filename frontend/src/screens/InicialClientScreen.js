// src/screens/InicialClientScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CardInfo from '../components/CardInfo';
import NavButton from '../components/NavButton';
import DogwalkerItem from '../components/DogwalkerItem';

export default function InicialClientScreen({ navigation }) {
    // Essa lista de dogwalkers pode vir de uma API no futuro
    const dogwalkers = [
        { name: 'Pedro' },
        { name: 'Lucas' },
        { name: 'Maria' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.greetingText}>Bem-vindo,</Text>
                    <Text style={styles.clientName}>[Nome do Cliente]!</Text>
                    <TouchableOpacity style={styles.notificationIcon}>
                        <Ionicons name="notifications-outline" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <CardInfo />

                <View style={styles.buttonContainer}>
                    <NavButton text="Meus Pets" icon="paw-outline" onPress={() => navigation.navigate("MyPets")} />
                    <NavButton text="Agendamento" icon="calendar-outline" onPress={() => navigation.navigate("Agendamento")} />
                    <NavButton text="Perfil" icon="person-outline" onPress={() => navigation.navigate("Perfil")} />
                </View>

                <View style={styles.dogwalkerSection}>
                    <View style={styles.dogwalkerHeader}>
                        <Text style={styles.dogwalkerTitle}>Dogwalkers</Text>
                        <TouchableOpacity>
                            <Text style={styles.findMoreText}>Find all</Text>
                        </TouchableOpacity>
                    </View>
                    {dogwalkers.map((dw, index) => (
                        <DogwalkerItem key={index} name={dw.name} />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FCEFE6' },
    container: { paddingHorizontal: 20, paddingTop: 20 },
    header: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 },
    greetingText: { fontSize: 22, color: '#000' },
    clientName: { fontSize: 22, fontWeight: 'bold', color: '#FF7A2D', marginLeft: 5 },
    notificationIcon: { marginLeft: 'auto' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
    dogwalkerSection: { marginTop: 20 },
    dogwalkerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    dogwalkerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FF7A2D' },
    findMoreText: { fontSize: 14, color: '#B0A3A0', textDecorationLine: 'underline' },
});