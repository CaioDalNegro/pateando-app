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

  // 🔐 Login real (autenticação via API)

  const login = async (email, password, selectedRole) => {
    
     // 1. Tenta autenticar na API
     const response = await api.post('/usuarios/login', { email, senha: password });
    
    // 2. Extrai o papel real do usuário retornado pela API
    // Presume-se que o campo que define a função no objeto de resposta é 'tipoUsuario'.
    // Adapte este nome de campo se for diferente na sua API.
    const actualRole = response.data.tipoUsuario; 

    // 🚩 3. VALIDAÇÃO DE FUNÇÃO: COMPARA A FUNÇÃO ESCOLHIDA COM A FUNÇÃO REAL
    if (actualRole !== selectedRole) {
        // Se a função real não corresponde à função escolhida, NEGA o login
        throw new Error("Função de acesso incompatível. Por favor, selecione a função correta.");
    }

    // 4. Se a validação for bem-sucedida, define o usuário no estado
    // Adiciona a role (real) ao objeto do usuário
    const usuario = { ...response.data, role: actualRole }; 
    
    setUser(usuario);

    // 5. Persiste o usuário
    if (Platform.OS !== 'web') {
      await AsyncStorage.setItem('user', JSON.stringify(usuario));
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

export default AuthProvider;