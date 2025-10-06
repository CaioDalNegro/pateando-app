import React from 'react';
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = React.createContext({});

// --- USUÁRIO FAKE PARA TESTES ---
const FAKE_DOGWALKER_USER = {
  id: 'dev-walker-123',
  nome: 'Walker Teste',
  email: 'teste@pateando.com',
  tipoUsuario: 'dogwalker',
};
// ------------------------------------

export const AuthProvider = ({ children }) => {
  // Inicia com o usuário fake para desenvolvimento
  const [user, setUser] = useState(FAKE_DOGWALKER_USER);
  
  // PARA VOLTAR AO NORMAL (COM TELA DE LOGIN), USE:
  // const [user, setUser] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);

  // Função de login real (pode ser usada no futuro)
  const login = async (email, password) => {
    const response = await api.post('/usuarios/login', { email, senha: password });
    const { token, usuario } = response.data;
    setUser(usuario);
    api.defaults.headers.Authorization = `Bearer ${token}`;
    if (Platform.OS !== 'web') {
      await AsyncStorage.setItem('user', JSON.stringify(usuario));
      await AsyncStorage.setItem('token', token);
    }
  };

  // Função de logout que funciona para o usuário fake também
  const logout = async () => {
    setUser(null);
    delete api.defaults.headers.Authorization;
    if (Platform.OS !== 'web') {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
    }
  };
  
  // Função para o botão de bypass, caso queira voltar a usá-lo
  const signInForDevelopment = (fakeUser) => {
    setUser(fakeUser);
    api.defaults.headers.Authorization = `Bearer FAKE_TOKEN_FOR_DEV`;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        logout,
        signInForDevelopment
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;