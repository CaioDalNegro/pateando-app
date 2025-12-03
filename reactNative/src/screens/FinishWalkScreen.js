import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function FinishWalkScreen({ navigation, route }) {
    const { user } = useContext(AuthContext);
    
    // Dados do passeio vindos da navegação
    const walkData = route.params?.walkData || {};
    
    const [observations, setObservations] = useState('');
    const [photos, setPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Função para adicionar foto (mockada por enquanto)
    const handleAddPhoto = () => {
        if (photos.length < 3) {
            setPhotos(prev => [
                ...prev, 
                `https://placehold.co/100x100/A5D6A7/000?text=Foto%20${prev.length + 1}`
            ]);
        } else {
            Alert.alert("Limite de Fotos", "Máximo de 3 fotos por passeio.");
        }
    };

    const handleFinalize = async () => {
        // Verificar se temos o ID do agendamento
        if (!walkData.appointmentId) {
            Alert.alert("Erro", "ID do agendamento não encontrado.");
            return;
        }

        setIsLoading(true);

        try {
            // Chamar a API para finalizar o passeio
            await api.put(`/agendamentos/${walkData.appointmentId}/finalizar`, {
                dogwalkerUsuarioId: user.id
            });

            console.log("Passeio finalizado com sucesso!", {
                appointmentId: walkData.appointmentId,
                observations,
                photoCount: photos.length
            });

            Alert.alert(
                "Sucesso! 🎉", 
                `Passeio de ${walkData.petName} finalizado com sucesso!`,
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate('DogWalkerHome')
                    }
                ]
            );

        } catch (error) {
            console.error("Erro ao finalizar passeio:", error.response?.data || error.message);
            
            let errorMessage = "Não foi possível finalizar o passeio.";
            
            if (error.response?.data) {
                errorMessage = typeof error.response.data === 'string' 
                    ? error.response.data 
                    : JSON.stringify(error.response.data);
            }
            
            Alert.alert("Erro", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close-outline" size={30} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Finalizar Serviço</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                
                {/* Pet e Estatísticas */}
                <View style={styles.summaryCard}>
                    <Ionicons name="paw-outline" size={32} color={COLORS.primary} style={styles.pawIcon} />
                    <Text style={styles.petName}>{walkData.petName || 'Pet'}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{walkData.duration || '-- min'}</Text>
                            <Text style={styles.statLabel}>Duração</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{walkData.distance || '-- km'}</Text>
                            <Text style={styles.statLabel}>Distância</Text>
                        </View>
                    </View>
                </View>

                {/* Seção de Fotos */}
                <Text style={styles.sectionTitle}>Fotos do Passeio ({photos.length}/3)</Text>
                <View style={styles.photosContainer}>
                    {photos.map((uri, index) => (
                        <View key={index} style={styles.photoPlaceholder}>
                            <Ionicons name="image-outline" size={24} color={COLORS.textSecondary} />
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto} disabled={photos.length >= 3}>
                        <Ionicons name="camera-outline" size={30} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* Campo de Observações */}
                <Text style={styles.sectionTitle}>Observações</Text>
                <TextInput
                    style={styles.textArea}
                    multiline
                    numberOfLines={4}
                    placeholder="Adicione notas importantes sobre o comportamento do pet, necessidades especiais, ou se ele fez as necessidades."
                    placeholderTextColor={COLORS.textSecondary}
                    value={observations}
                    onChangeText={setObservations}
                />

                <TouchableOpacity 
                    style={[styles.finalizeButton, isLoading && styles.finalizeButtonDisabled]} 
                    onPress={handleFinalize} 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color={COLORS.white} size="small" />
                            <Text style={styles.finalizeButtonText}>  Finalizando...</Text>
                        </View>
                    ) : (
                        <View style={styles.loadingContainer}>
                            <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.white} />
                            <Text style={styles.finalizeButtonText}>  Finalizar Serviço</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: COLORS.background 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.card,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        padding: 5,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 20,
        marginBottom: 10,
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    pawIcon: {
        marginBottom: 10,
    },
    petName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 15,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    statBox: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: COLORS.background,
        borderRadius: 10,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    photosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    photoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textArea: {
        minHeight: 120,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: COLORS.textPrimary,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: COLORS.card,
    },
    finalizeButton: {
        backgroundColor: '#00C853',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 10,
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    finalizeButtonDisabled: {
        backgroundColor: '#88E0A3',
    },
    finalizeButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});