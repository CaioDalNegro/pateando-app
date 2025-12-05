import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, SafeAreaView, StyleSheet, TouchableOpacity, 
  FlatList, Image, ActivityIndicator, Alert, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const DogwalkerCard = ({ dogwalker, isSelected, onSelect }) => {
  const usuario = dogwalker.usuario || {};
  const isAvailable = dogwalker.disponibilidade === 'DISPONIVEL';
  
  return (
    <TouchableOpacity 
      style={[
        styles.dogwalkerCard, 
        isSelected && styles.dogwalkerCardSelected,
        !isAvailable && styles.dogwalkerCardDisabled
      ]}
      onPress={() => onSelect(dogwalker)}
      disabled={!isAvailable}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: dogwalker.fotoUrl || 'https://via.placeholder.com/80/FF7A2D/FFFFFF?text=DW' }} 
          style={[styles.dogwalkerPhoto, !isAvailable && styles.photoDisabled]}
        />
        <View style={styles.dogwalkerInfo}>
          <Text style={[styles.dogwalkerName, !isAvailable && styles.textDisabled]}>
            {usuario.nome || 'Dogwalker'}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={isAvailable ? "#FFD700" : "#CCC"} />
            <Text style={[styles.ratingText, !isAvailable && styles.textDisabled]}>
              {dogwalker.avaliacaoMedia?.toFixed(1) || '5.0'} 
            </Text>
            <Text style={[styles.totalWalks, !isAvailable && styles.textDisabled]}>
              ({dogwalker.totalPasseios || 0} passeios)
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#4CAF50' : '#FF5722' }]} />
            <Text style={[styles.statusText, !isAvailable && { color: '#FF5722' }]}>
              {isAvailable ? 'Disponível' : 'Em passeio'}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={28} color={COLORS.primary} />
          </View>
        )}
      </View>
      {dogwalker.descricao && (
        <Text style={[styles.description, !isAvailable && styles.textDisabled]} numberOfLines={2}>
          {dogwalker.descricao}
        </Text>
      )}
      <View style={styles.pricesContainer}>
        <View style={styles.priceItem}>
          <Text style={[styles.priceDuration, !isAvailable && styles.textDisabled]}>30 min</Text>
          <Text style={[styles.priceValue, !isAvailable && styles.textDisabled]}>R$ {dogwalker.preco30min?.toFixed(2) || '25.00'}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceItem}>
          <Text style={[styles.priceDuration, !isAvailable && styles.textDisabled]}>60 min</Text>
          <Text style={[styles.priceValue, !isAvailable && styles.textDisabled]}>R$ {dogwalker.preco60min?.toFixed(2) || '40.00'}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceItem}>
          <Text style={[styles.priceDuration, !isAvailable && styles.textDisabled]}>90 min</Text>
          <Text style={[styles.priceValue, !isAvailable && styles.textDisabled]}>R$ {dogwalker.preco90min?.toFixed(2) || '55.00'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function SelectDogWalkerScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const { petIds, petNames, petsCount, durationId, durationMinutes, price, totalPrice, dateTime } = route.params;

  const [dogwalkers, setDogwalkers] = useState([]);
  const [selectedDogwalker, setSelectedDogwalker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchDogwalkers(); }, []);

  const fetchDogwalkers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/dogwalkers/disponiveis');
      setDogwalkers(response.data);
    } catch (error) {
      try {
        const fallbackResponse = await api.get('/dogwalkers');
        setDogwalkers(fallbackResponse.data);
      } catch (fallbackError) {
        Alert.alert('Erro', 'Não foi possível carregar os dogwalkers.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDogwalker = (dogwalker) => {
    if (dogwalker.disponibilidade !== 'DISPONIVEL') {
      Alert.alert('Indisponível', 'Este dogwalker não está disponível no momento.');
      return;
    }
    setSelectedDogwalker(dogwalker);
  };

  const handleContinueToPayment = () => {
    if (!selectedDogwalker) {
      Alert.alert('Selecione', 'Por favor, selecione um dogwalker.');
      return;
    }
    navigation.navigate('Payment', {
      petIds, petNames, petsCount, durationMinutes, price, totalPrice, dateTime,
      dogwalkerId: selectedDogwalker.id,
      dogwalkerName: selectedDogwalker.usuario?.nome || 'Dogwalker',
    });
  };

  const formatDateTime = () => {
    const date = new Date(dateTime);
    const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} às ${timeStr}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Buscando dogwalkers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escolher Dog Walker</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Ionicons name="paw" size={18} color={COLORS.primary} />
          <Text style={styles.summaryText}>{petsCount > 1 ? `${petsCount} pets: ` : ''}{petNames}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
          <Text style={styles.summaryText}>{formatDateTime()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="time-outline" size={18} color={COLORS.primary} />
          <Text style={styles.summaryText}>{durationMinutes} minutos • {price}</Text>
        </View>
      </View>
      <FlatList
        data={dogwalkers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DogwalkerCard dogwalker={item} isSelected={selectedDogwalker?.id === item.id} onSelect={handleSelectDogwalker} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhum dogwalker encontrado</Text>
          </View>
        }
      />
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedDogwalker && styles.continueButtonDisabled]}
          onPress={handleContinueToPayment}
          disabled={!selectedDogwalker}
        >
          <Text style={styles.continueButtonText}>Continuar para Pagamento</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: COLORS.textSecondary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.card },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  summaryCard: { backgroundColor: COLORS.white, margin: 16, padding: 16, borderRadius: 12, gap: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryText: { fontSize: 14, color: COLORS.textPrimary },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  dogwalkerCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: 'transparent', elevation: 2 },
  dogwalkerCardSelected: { borderColor: COLORS.primary },
  dogwalkerCardDisabled: { opacity: 0.6, backgroundColor: '#F5F5F5' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dogwalkerPhoto: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.card },
  photoDisabled: { opacity: 0.5 },
  dogwalkerInfo: { flex: 1, marginLeft: 12 },
  dogwalkerName: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  textDisabled: { color: COLORS.textSecondary },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary, marginLeft: 4 },
  totalWalks: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 4 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: COLORS.textSecondary },
  checkmark: { marginLeft: 'auto' },
  description: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12, lineHeight: 20 },
  pricesContainer: { flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: 8, padding: 12 },
  priceItem: { flex: 1, alignItems: 'center' },
  priceDivider: { width: 1, backgroundColor: COLORS.card },
  priceDuration: { fontSize: 12, color: COLORS.textSecondary },
  priceValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginTop: 2 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 16 },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.card },
  continueButton: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  continueButtonDisabled: { backgroundColor: COLORS.textSecondary },
  continueButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});