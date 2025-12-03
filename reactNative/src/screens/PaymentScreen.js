import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, 
  TextInput, ActivityIndicator, Alert, Platform, StatusBar, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export default function PaymentScreen({ route, navigation }) {
  // Recebe os dados da tela anterior
  const { appointment } = route.params || { 
    appointment: { 
      dogwalkerName: 'Ana Clara', 
      petName: 'Rex', 
      price: 25.00, 
      date: 'Hoje', 
      time: '14:00' 
    } 
  };

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);

  // Estados do formulário (apenas visual)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const handlePayment = () => {
    // Validação visual simples
    if (paymentMethod === 'credit_card' && (cardNumber.length < 10 || cardName.length < 3)) {
      Alert.alert('Atenção', 'Por favor, preencha os dados do cartão para simular.');
      return;
    }

    setLoading(true);

    // Simula processamento (2 segundos)
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Pagamento Aprovado! 🎉',
        'Seu passeio foi agendado com sucesso. O Dogwalker foi notificado.',
        [
          { 
            text: 'Voltar ao Início', 
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'InicialClient' }],
            })
          }
        ]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* RESUMO DO PEDIDO */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo do Pedido</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dogwalker</Text>
            <Text style={styles.summaryValue}>{appointment.dogwalkerName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pet</Text>
            <Text style={styles.summaryValue}>{appointment.petName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Data</Text>
            <Text style={styles.summaryValue}>{appointment.date}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Horário</Text>
            <Text style={styles.summaryValue}>{appointment.time}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <Text style={styles.totalValue}>R$ {appointment.price.toFixed(2)}</Text>
          </View>
        </View>

        {/* SELEÇÃO DE MÉTODO */}
        <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
        
        <View style={styles.methodsContainer}>
          <TouchableOpacity 
            style={[styles.methodButton, paymentMethod === 'credit_card' && styles.methodButtonActive]}
            onPress={() => setPaymentMethod('credit_card')}
          >
            <Ionicons name="card-outline" size={24} color={paymentMethod === 'credit_card' ? '#FFF' : COLORS.primary} />
            <Text style={[styles.methodText, paymentMethod === 'credit_card' && styles.methodTextActive]}>Cartão</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodButton, paymentMethod === 'pix' && styles.methodButtonActive]}
            onPress={() => setPaymentMethod('pix')}
          >
            <Ionicons name="qr-code-outline" size={24} color={paymentMethod === 'pix' ? '#FFF' : COLORS.primary} />
            <Text style={[styles.methodText, paymentMethod === 'pix' && styles.methodTextActive]}>PIX</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodButton, paymentMethod === 'cash' && styles.methodButtonActive]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cash' ? '#FFF' : COLORS.primary} />
            <Text style={[styles.methodText, paymentMethod === 'cash' && styles.methodTextActive]}>Dinheiro</Text>
          </TouchableOpacity>
        </View>

        {/* FORMULÁRIO DINÂMICO */}
        {paymentMethod === 'credit_card' && (
          <View style={styles.cardForm}>
            <Text style={styles.inputLabel}>Número do Cartão</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0000 0000 0000 0000" 
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            
            <Text style={styles.inputLabel}>Nome no Cartão</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nome como está no cartão" 
              value={cardName}
              onChangeText={setCardName}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Validade</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="MM/AA" 
                  keyboardType="numeric"
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="123" 
                  keyboardType="numeric"
                  maxLength={3}
                  value={cardCvv}
                  onChangeText={setCardCvv}
                />
              </View>
            </View>
          </View>
        )}

        {paymentMethod === 'pix' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Ao finalizar, um código PIX copia-e-cola será gerado. O agendamento será confirmado automaticamente após o pagamento.
            </Text>
          </View>
        )}

        {paymentMethod === 'cash' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Você pagará R$ {appointment.price.toFixed(2)} diretamente ao Dogwalker no momento do passeio.
            </Text>
          </View>
        )}

      </ScrollView>

      {/* BOTÃO DE AÇÃO */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.payButton} 
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payButtonText}>
              Pagar R$ {appointment.price.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || '#FCEFE6',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { color: '#666', fontSize: 16 },
  summaryValue: { color: '#333', fontSize: 16, fontWeight: '500' },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  methodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: '#FFF',
  },
  methodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  methodText: {
    marginTop: 8,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  methodTextActive: {
    color: '#FFF',
  },
  cardForm: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
  },
  inputLabel: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  infoText: {
    color: '#E65100',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  payButton: {
    backgroundColor: '#00C853',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});