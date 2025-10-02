// src/services/api.js
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Corrigido para ter apenas uma baseURL ativa.
//    Descomente a linha que você quer usar e comente a outra.
const api = axios.create({
  baseURL: "http://10.110.12.27:8080", // <-- ESTA ESTÁ ATIVA
  // baseURL: "http://10.110.12.20:8081", // <-- ESTA ESTÁ INATIVA
});


// 2. Adicionado o interceptor para injetar o token de autenticação.
//    Isso garante que toda requisição para a API já vai com o token do usuário logado.
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;