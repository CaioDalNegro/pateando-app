import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const paymentMethods = [
  { id: 'pix', name: 'PIX', icon: 'qr-code-outline', description: 'Pagamento instantâneo' },
  { id: 'credit', name: 'Cartão de Crédito', icon: 'card-outline', description: 'Visa, Master, Elo' },
  { id: 'debit', name: 'Cartão de Débito', icon: 'card-outline', description: 'Débito na hora' },
  { id: 'cash', name: 'Dinheiro', icon: 'cash-outline', description: 'Pague ao dogwalker' },
];

export default function PaymentScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const { petIds, petNames, petsCount, durationMinutes, price, totalPrice, dateTime, dogwalkerId, dogwalkerName } = route.params;

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateTime = () => {
    const date = new Date(dateTime);
    const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { dateStr, timeStr };
  };

  const { dateStr, timeStr } = formatDateTime();

  const handleConfirmPayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Selecione', 'Por favor, selecione uma forma de pagamento.');
      return;
    }

    setIsSubmitting(true);

    try {
      const dataHora = new Date(dateTime).toISOString().slice(0, 19);

      const agendamentoData = {
        clienteId: user.id,
        petIds: petIds,  // Array de IDs
        dogwalkerId: dogwalkerId,
        dataHora: dataHora,
        duracao: durationMinutes,
        observacoes: `Passeio de ${durationMinutes} min com ${petsCount} pet(s). Pagamento: ${selectedMethod.name}`,
      };

      console.log('Enviando agendamento:', agendamentoData);
      const response = await api.post('/agendamentos/criar', agendamentoData);
      console.log('Agendamento criado:', response.data);

      Alert.alert(
        'Sucesso! 🎉',
        `Seu pedido de passeio foi enviado para ${dogwalkerName}! Aguarde a confirmação.`,
        [{ text: 'OK', onPress: () => navigation.navigate('InicialClient') }]
      );
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      Alert.alert('Erro', error.response?.data || 'Não foi possível criar o agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo do Passeio</Text>
          <View style={styles.summaryItem}>
            <Ionicons name="paw" size={20} color={COLORS.primary} />
            <Text style={styles.summaryLabel}>Pet{petsCount > 1 ? 's' : ''}:</Text>
            <Text style={styles.summaryValue}>{petNames}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
            <Text style={styles.summaryLabel}>Dogwalker:</Text>
            <Text style={styles.summaryValue}>{dogwalkerName}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="time" size={20} color={COLORS.primary} />
            <Text style={styles.summaryLabel}>Duração:</Text>
            <Text style={styles.summaryValue}>{durationMinutes} minutos</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.summaryLabel}>Data:</Text>
            <Text style={styles.summaryValue}>{dateStr}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="alarm" size={20} color={COLORS.primary} />
            <Text style={styles.summaryLabel}>Horário:</Text>
            <Text style={styles.summaryValue}>{timeStr}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>R$ {totalPrice || price}</Text>
          </View>
          {petsCount > 1 && (
            <Text style={styles.extraInfo}>* Inclui taxa de R$10 por pet adicional</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodCard, selectedMethod?.id === method.id && styles.methodCardSelected]}
            onPress={() => setSelectedMethod(method)}
          >
            <View style={styles.methodIconContainer}>
              <Ionicons name={method.icon} size={24} color={selectedMethod?.id === method.id ? COLORS.white : COLORS.primary} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodDescription}>{method.description}</Text>
            </View>
            {selectedMethod?.id === method.id && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, (!selectedMethod || isSubmitting) && styles.confirmButtonDisabled]}
          onPress={handleConfirmPayment}
          disabled={!selectedMethod || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
              <Text style={styles.confirmButtonPrice}>R$ {totalPrice || price}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.card },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  content: { padding: 16, paddingBottom: 120 },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 24 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary, width: 80 },
  summaryValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500', flex: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.background },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  extraInfo: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8, fontStyle: 'italic' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  methodCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  methodCardSelected: { borderColor: COLORS.primary },
  methodIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 122, 45, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  methodDescription: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.card },
  confirmButton: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
  confirmButtonDisabled: { backgroundColor: COLORS.textSecondary },
  confirmButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  confirmButtonPrice: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
});