import react, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from './src/context/AuthContext';
import api from './src/services/api';

export default function RegisterPetClientScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [peso, setPeso] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const savePet = async () => {
    if (!nome || !idade || !peso) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
      return;
    }

    const petData = {
      nome,
      idade: parseInt(idade),
      peso: parseFloat(peso),
      observacoes,
    };

    try {
      setIsLoading(true);
      const response = await api.post(`/pets/create/${user.id}`, petData);
      Alert.alert('Sucesso', `Pet ${response.data.nome} registrado com sucesso!`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar o pet.');
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>
            Sobre seu <Text style={styles.headerHighlight}>Pet</Text>
          </Text>
          <View style={styles.iconBell}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </View>
        </View>

        {/* Avatar do pet */}
        <View style={styles.avatarContainer}>
          <View style={styles.circle}>
            <View style={styles.boneShape}>
              <Text style={styles.boneText}>{nome || 'Name'}</Text>
            </View>
          </View>
        </View>

        {/* Campo para nome */}
        <TextInput
          style={styles.inputName}
          placeholder="Digite o nome do seu cachorro"
          value={nome}
          onChangeText={setNome}
        />

        {/* Campos */}
        <View style={styles.form}>
          <Text style={styles.label}>
            Qual a idade do seu <Text style={styles.highlight}>Cachorro?</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={idade}
            onChangeText={setIdade}
            keyboardType="numeric"
          />

          <Text style={styles.label}>
            Qual o peso do seu <Text style={styles.highlight}>Cachorro?</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={peso}
            onChangeText={setPeso}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Informações adicionais</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
          />
        </View>

        {/* Botão CRIAR */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={savePet}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>CRIAR</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF6EE',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 22,
    color: '#000',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerHighlight: {
    color: '#FF914D',
  },
  iconBell: {
    width: 30,
    alignItems: 'flex-end',
  },
  avatarContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  circle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#FF914D',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  boneShape: {
    backgroundColor: '#FF914D',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    position: 'absolute',
    bottom: -15,
  },
  boneText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputName: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 45,
    marginTop: 40,
    marginBottom: 30,
    paddingHorizontal: 12,
    borderColor: '#FFE0C0',
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 15,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 15,
    color: '#000',
    marginBottom: 5,
  },
  highlight: {
    color: '#FF914D',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 45,
    marginBottom: 20,
    paddingHorizontal: 12,
    borderColor: '#FFE0C0',
    borderWidth: 1,
  },
  createButton: {
    backgroundColor: '#FF914D',
    borderRadius: 12,
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});