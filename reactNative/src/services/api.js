// src/services/api.js
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Corrigido para ter apenas uma baseURL ativa.
//    Descomente a linha que você quer usar e comente a outra.
const api = axios.create({

  /*
    - Use localhost para rodar no PC.
    - Use o IP da maquina para rodar no mobile.
  */
<<<<<<< HEAD
  baseURL: "http://10.110.12.27:8081",
=======
  baseURL: "http://10.110.12.25:8080",
>>>>>>> f42b600f1792cafda856f6c002bf8b29762ab5f2
  //baseURL: "http://localhost:8080",
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