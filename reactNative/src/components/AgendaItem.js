import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

/**
 * Componente que exibe um item de agendamento na lista do Dogwalker
 * @param {object} appointment - Dados do agendamento
 * @param {boolean} isNext - Indica se é o próximo agendamento
 */
export default function AgendaItem({ appointment, isNext }) {
  // Definir cor e texto baseado no status
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: '#FF9800', text: 'Aguardando confirmação', icon: 'time-outline' };
      case 'scheduled':
        return { color: '#2196F3', text: 'Agendado', icon: 'calendar-outline' };
      case 'active':
        return { color: '#4CAF50', text: 'Em andamento', icon: 'walk-outline' };
      case 'completed':
        return { color: '#9E9E9E', text: 'Concluído', icon: 'checkmark-circle-outline' };
      case 'cancelled':
        return { color: '#F44336', text: 'Cancelado', icon: 'close-circle-outline' };
      default:
        return { color: COLORS.textSecondary, text: status, icon: 'help-outline' };
    }
  };

  const statusInfo = getStatusInfo(appointment.status);

  return (
    <View style={[
      styles.container, 
      isNext && styles.containerNext,
      appointment.status === 'pending' && styles.containerPending
    ]}>
      {/* Header com horário e status */}
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color={COLORS.primary} />
          <Text style={styles.timeText}>{appointment.time}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
          <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Info do Pet e Cliente */}
      <View style={styles.infoContainer}>
        <View style={styles.petInfo}>
          <View style={styles.petAvatar}>
            <Ionicons name="paw" size={20} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.petName}>{appointment.petName}</Text>
            {appointment.clientName && (
              <Text style={styles.clientName}>
                <Ionicons name="person-outline" size={12} color={COLORS.textSecondary} />
                {' '}{appointment.clientName}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Valor</Text>
          <Text style={styles.priceValue}>R$ {appointment.price?.toFixed(2) || '0.00'}</Text>
        </View>
      </View>

      {/* Observações se houver */}
      {appointment.observacoes && (
        <View style={styles.observacoesContainer}>
          <Ionicons name="chatbubble-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.observacoesText} numberOfLines={2}>
            {appointment.observacoes}
          </Text>
        </View>
      )}

      {/* Indicador de próximo */}
      {isNext && (
        <View style={styles.nextBadge}>
          <Text style={styles.nextBadgeText}>Próximo</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  containerNext: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  containerPending: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  petAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  clientName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  observacoesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.card,
  },
  observacoesText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  nextBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 8,
  },
  nextBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});