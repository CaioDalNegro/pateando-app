import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, SafeAreaView, StyleSheet, TouchableOpacity, 
  FlatList, Image, ActivityIndicator, Alert, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

// Componente de Card do Dogwalker
const DogwalkerCard = ({ dogwalker, isSelected, onSelect }) => {
  const usuario = dogwalker.usuario || {};
  
  return (
    <TouchableOpacity 
      style={[styles.dogwalkerCard, isSelected && styles.dogwalkerCardSelected]}
      onPress={() => onSelect(dogwalker)}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: dogwalker.fotoUrl || 'https://via.placeholder.com/80/FF7A2D/FFFFFF?text=DW' }} 
          style={styles.dogwalkerPhoto}
        />
        <View style={styles.dogwalkerInfo}>
          <Text style={styles.dogwalkerName}>{usuario.nome || 'Dogwalker'}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {dogwalker.avaliacaoMedia?.toFixed(1) || '5.0'} 
            </Text>
            <Text style={styles.totalWalks}>
              ({dogwalker.totalPasseios || 0} passeios)
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: dogwalker.disponibilidade === 'DISPONIVEL' ? '#4CAF50' : '#FF5722' }
            ]} />
            <Text style={styles.statusText}>
              {dogwalker.disponibilidade === 'DISPONIVEL' ? 'Disponível' : 'Indisponível'}
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
        <Text style={styles.description} numberOfLines={2}>
          {dogwalker.descricao}
        </Text>
      )}

      <View style={styles.pricesContainer}>
        <View style={styles.priceItem}>
          <Text style={styles.priceDuration}>30 min</Text>
          <Text style={styles.priceValue}>R$ {dogwalker.preco30min?.toFixed(2) || '25.00'}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceItem}>
          <Text style={styles.priceDuration}>60 min</Text>
          <Text style={styles.priceValue}>R$ {dogwalker.preco60min?.toFixed(2) || '40.00'}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceItem}>
          <Text style={styles.priceDuration}>90 min</Text>
          <Text style={styles.priceValue}>R$ {dogwalker.preco90min?.toFixed(2) || '55.00'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function SelectDogWalkerScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const { petId, petName, durationId, durationMinutes, price, dateTime } = route.params;

  const [dogwalkers, setDogwalkers] = useState([]);
  const [selectedDogwalker, setSelectedDogwalker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar dogwalkers disponíveis
  useEffect(() => {
    fetchDogwalkers();
  }, []);

  const fetchDogwalkers = async () => {
    try {
      setIsLoading(true);
      // Buscar dogwalkers disponíveis
      const response = await api.get('/dogwalkers/disponiveis');
      setDogwalkers(response.data);
    } catch (error) {
      console.error('Erro ao buscar dogwalkers:', error);
      // Se não houver dogwalkers disponíveis, mostrar lista vazia
      // ou buscar todos os dogwalkers como fallback
      try {
        const fallbackResponse = await api.get('/dogwalkers');
        setDogwalkers(fallbackResponse.data);
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
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

  const handleConfirmBooking = async () => {
    if (!selectedDogwalker) {
      Alert.alert('Selecione', 'Por favor, selecione um dogwalker.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Formatar a data para o backend
      const dataHora = new Date(dateTime).toISOString().slice(0, 19); // Remove o 'Z' do final

      const agendamentoData = {
        clienteId: user.id,
        petId: petId,
        dogwalkerId: selectedDogwalker.id,
        dataHora: dataHora,
        duracao: durationMinutes,
        observacoes: `Passeio de ${durationMinutes} minutos`,
      };

      console.log('Enviando agendamento:', agendamentoData);

      const response = await api.post('/agendamentos/criar', agendamentoData);

      console.log('Agendamento criado:', response.data);

      Alert.alert(
        'Sucesso! 🎉',
        `Seu pedido de passeio foi enviado para ${selectedDogwalker.usuario?.nome || 'o dogwalker'}! Aguarde a confirmação.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('InicialClient'),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao criar agendamento:', error.response?.data || error.message);
      Alert.alert(
        'Erro',
        error.response?.data || 'Não foi possível criar o agendamento. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatar a data para exibição
  const formattedDate = new Date(dateTime).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const formattedTime = new Date(dateTime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Escolha um Dog Walker</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Resumo do Agendamento */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Ionicons name="paw" size={20} color={COLORS.primary} />
          <Text style={styles.summaryText}>Pet: <Text style={styles.summaryHighlight}>{petName || 'Seu pet'}</Text></Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="time-outline" size={20} color={COLORS.primary} />
          <Text style={styles.summaryText}>Duração: <Text style={styles.summaryHighlight}>{durationMinutes} min</Text> - <Text style={styles.summaryHighlight}>{price}</Text></Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.summaryText}>{formattedDate} às {formattedTime}</Text>
        </View>
      </View>

      {/* Lista de Dogwalkers */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Buscando dogwalkers...</Text>
        </View>
      ) : dogwalkers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Nenhum dogwalker disponível no momento.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDogwalkers}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={dogwalkers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DogwalkerCard
              dogwalker={item}
              isSelected={selectedDogwalker?.id === item.id}
              onSelect={handleSelectDogwalker}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Botão de Confirmar */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedDogwalker || isSubmitting) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmBooking}
          disabled={!selectedDogwalker || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  backButton: {
    padding: 8,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: COLORS.textPrimary,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryHighlight: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  dogwalkerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dogwalkerCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF8F5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dogwalkerPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.card,
  },
  dogwalkerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dogwalkerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalWalks: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  checkmark: {
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    lineHeight: 20,
  },
  pricesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.card,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 2,
  },
  priceDivider: {
    width: 1,
    backgroundColor: COLORS.card,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.card,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
