import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';

// Mensagens simuladas iniciais
const getInitialMessages = (dogwalkerName, petNames) => [
  {
    id: '1',
    text: `Olá! Sou ${dogwalkerName}, vou cuidar bem do(s) ${petNames}! 🐕`,
    sender: 'dogwalker',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    text: 'Estamos saindo agora para o passeio!',
    sender: 'dogwalker',
    timestamp: new Date(Date.now() - 240000),
  },
];

// Respostas automáticas do dogwalker (simulado)
const autoResponses = [
  'Tudo certo por aqui! 👍',
  'O passeio está indo muito bem!',
  'Eles estão se divertindo bastante! 🐾',
  'Já demos uma boa caminhada!',
  'Estamos no parque agora, eles adoraram!',
  'Vou mandar uma foto em breve!',
  'Comportamento exemplar! 🌟',
  'Estamos voltando em alguns minutos.',
];

const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.messageBubble, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
        {message.text}
      </Text>
      <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
};

export default function ChatScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const flatListRef = useRef(null);

  // Dados do passeio
  const {
    agendamentoId,
    dogwalkerName = 'Dogwalker',
    petNames = 'Pet',
    dogwalkerPhone,
  } = route.params || {};

  const [messages, setMessages] = useState(() => 
    getInitialMessages(dogwalkerName, petNames)
  );
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Scroll para o fim quando novas mensagens chegam
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Simular resposta do dogwalker
  const simulateDogwalkerResponse = () => {
    setIsTyping(true);
    
    // Tempo aleatório entre 1-3 segundos
    const delay = 1000 + Math.random() * 2000;
    
    setTimeout(() => {
      setIsTyping(false);
      const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];
      
      const newMessage = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: 'dogwalker',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);
    }, delay);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'client',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simular resposta automática
    simulateDogwalkerResponse();
  };

  // Mensagens rápidas pré-definidas
  const quickMessages = [
    'Tudo bem?',
    'Como estão?',
    'Pode mandar foto?',
    'Que horas voltam?',
  ];

  const handleQuickMessage = (text) => {
    setInputText(text);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>{dogwalkerName}</Text>
            <Text style={styles.headerSubtitle}>
              {isTyping ? 'Digitando...' : 'Online'}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => {
            if (dogwalkerPhone) {
              import('react-native').then(({ Linking }) => {
                Linking.openURL(`tel:${dogwalkerPhone}`);
              });
            }
          }}
        >
          <Ionicons name="call" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Info do passeio */}
      <View style={styles.walkInfo}>
        <Ionicons name="paw" size={16} color={COLORS.textSecondary} />
        <Text style={styles.walkInfoText}>Passeio com {petNames}</Text>
      </View>

      {/* Lista de mensagens */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} isOwn={item.sender === 'client'} />
        )}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Indicador de digitando */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{dogwalkerName} está digitando...</Text>
        </View>
      )}

      {/* Mensagens rápidas */}
      <View style={styles.quickMessagesContainer}>
        {quickMessages.map((msg, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickMessageButton}
            onPress={() => handleQuickMessage(msg)}
          >
            <Text style={styles.quickMessageText}>{msg}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input de mensagem */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={COLORS.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 122, 45, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
  },
  callButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 122, 45, 0.1)',
    borderRadius: 20,
  },
  walkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  walkInfoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  ownMessageText: {
    color: COLORS.white,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  typingIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  quickMessagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.card,
  },
  quickMessageButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.card,
  },
  quickMessageText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: COLORS.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
});