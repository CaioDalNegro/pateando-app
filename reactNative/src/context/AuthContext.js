// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      // Na web, o AsyncStorage pode não estar disponível ou pode causar erros na inicialização.
      // Por enquanto, vamos pular a persistência de login na web para evitar o erro.
      if (Platform.OS === 'web') {
        setIsLoading(false);
        return;
      }
      
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      }
      setIsLoading(false);
    };

    loadUserFromStorage();
  }, []);

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

  const logout = async () => {
    setUser(null);
    delete api.defaults.headers.Authorization;
    if (Platform.OS !== 'web') {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; // Corrigindo a exportação