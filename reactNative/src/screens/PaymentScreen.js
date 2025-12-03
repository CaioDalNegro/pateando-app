import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

// Métodos de pagamento disponíveis
const paymentMethods = [
  { id: 'pix', name: 'PIX', icon: 'qr-code-outline', description: 'Pagamento instantâneo' },
  { id: 'credit', name: 'Cartão de Crédito', icon: 'card-outline', description: 'Visa, Mastercard, Elo' },
  { id: 'debit', name: 'Cartão de Débito', icon: 'card-outline', description: 'Débito online' },
  { id: 'cash', name: 'Dinheiro', icon: 'cash-outline', description: 'Pagar ao dogwalker' },
];

export default function PaymentScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const { 
    petId, 
    petName, 
    durationMinutes, 
    price, 
    dateTime, 
    dogwalker 
  } = route.params || {};

  const [selectedPayment, setSelectedPayment] = useState('pix');
  const [isProcessing, setIsProcessing] = useState(false);

  // Formatar data para exibição
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Extrair valor numérico do preço
  const getPriceValue = () => {
    if (!price) return 0;
    const numericPrice = parseFloat(price.replace('R$ ', '').replace(',', '.'));
    return isNaN(numericPrice) ? 0 : numericPrice;
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);

    try {
      // Formatar a data para o backend
      const dataHora = new Date(dateTime).toISOString().slice(0, 19);

      const agendamentoData = {
        clienteId: user.id,
        petId: petId,
        dogwalkerId: dogwalker.id,
        dataHora: dataHora,
        duracao: durationMinutes,
        observacoes: `Passeio de ${durationMinutes} minutos - Pagamento: ${selectedPayment.toUpperCase()}`,
      };

      console.log('Criando agendamento:', agendamentoData);

      const response = await api.post('/agendamentos/criar', agendamentoData);

      console.log('Agendamento criado:', response.data);

      Alert.alert(
        'Pagamento Confirmado! 🎉',
        `Seu passeio com ${dogwalker.usuario?.nome || 'o dogwalker'} foi agendado com sucesso!\n\nAguarde a confirmação do dogwalker.`,
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
        error.response?.data || 'Não foi possível processar o pagamento. Tente novamente.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Resumo do Pedido */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo do Pedido</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Ionicons name="paw" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Pet</Text>
              <Text style={styles.summaryValue}>{petName || 'Pet'}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Dog Walker</Text>
              <Text style={styles.summaryValue}>{dogwalker?.usuario?.nome || 'Dogwalker'}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Duração</Text>
              <Text style={styles.summaryValue}>{durationMinutes} minutos</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Data e Hora</Text>
              <Text style={styles.summaryValue}>
                {formatDate(dateTime)} às {formatTime(dateTime)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{price || 'R$ 0,00'}</Text>
          </View>
        </View>

        {/* Métodos de Pagamento */}
        <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
        
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentOption,
              selectedPayment === method.id && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment(method.id)}
          >
            <View style={styles.paymentIconContainer}>
              <Ionicons
                name={method.icon}
                size={24}
                color={selectedPayment === method.id ? COLORS.primary : COLORS.textSecondary}
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text
                style={[
                  styles.paymentName,
                  selectedPayment === method.id && styles.paymentNameSelected,
                ]}
              >
                {method.name}
              </Text>
              <Text style={styles.paymentDescription}>{method.description}</Text>
            </View>
            <View style={styles.radioOuter}>
              {selectedPayment === method.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Botão Confirmar */}
      <View style={styles.bottomContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total a pagar</Text>
          <Text style={styles.priceValue}>{price || 'R$ 0,00'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]}
          onPress={handleConfirmPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.confirmButtonText}>Confirmar Pagamento</Text>
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
    backgroundColor: COLORS.background,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 150,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 122, 45, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.card,
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF8F5',
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  paymentNameSelected: {
    color: COLORS.primary,
  },
  paymentDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});