import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export const AuthContext = React.createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      if (Platform.OS === "web") {
        setIsLoading(false);
        return;
      }

      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        // Reaplicar o token ao header da API
        api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      }
      setIsLoading(false);
    };

    loadUserFromStorage();
  }, []);

  const login = async (email, password) => {
    try {
        const response = await api.post("/usuarios/login", {
            email,
            senha: password, // ✅ Envia a senha em texto puro
        });

        const apiData = response.data;
        
        // 🛑 CORREÇÃO FINAL: Extração do Token do BODY OU do HEADER
        
        // 1. Tenta pegar o token das chaves mais comuns no BODY
        let token = apiData.token || apiData.accessToken || apiData.jwt || apiData.idToken;
        
        // 2. Se o Token não for encontrado no BODY, procura no HEADER
        // O Spring Security geralmente usa o cabeçalho 'Authorization' ou 'X-Auth-Token'
        if (!token && response.headers && response.headers.authorization) {
            const header = response.headers.authorization;
            if (header.startsWith('Bearer ')) {
                token = header.substring(7); // Remove "Bearer "
            } else {
                token = header;
            }
        }
        
        // 3. Tenta pegar o usuário da chave 'usuario', 'user' ou assume que é o objeto raiz (que é o caso)
        const usuario = apiData.usuario || apiData.user || apiData; 
        
        // 👇👇 TEMPORARY BYPASS FOR DEVELOPMENT 👇👇
        // O log mostrou que o token está AUSENTE do backend. Para permitir o desenvolvimento, 
        // definimos um token dummy se ele estiver faltando e o usuário estiver presente.
        if (usuario && typeof usuario === 'object' && !Array.isArray(usuario) && !token) {
            console.warn("⚠️ Token de segurança ausente! Usando token dummy para DEV. CORRIJA O BACKEND!");
            token = 'FAKE_TOKEN_FOR_DEV_ONLY'; 
        }
        
        // NOVO CHECK DE SEGURANÇA: Lança um erro se o Usuário estiver faltando
        if (!usuario || typeof usuario !== 'object' || Array.isArray(usuario)) {
             console.error("Dados de usuário incompletos na resposta da API:", {
                 dadosRecebidos: apiData,
                 tokenTentado: token,
                 usuarioTentado: usuario
             });
             throw new Error("Login bem-sucedido, mas dados de usuário incompletos ou inválidos.");
        }
        
        // 1. Aplicar o token ao header da API
        api.defaults.headers.Authorization = `Bearer ${token}`;
        
        // 2. Setar o usuário no estado global
        setUser(usuario);

        // 3. Salvar token e usuário 
        if (Platform.OS !== "web") {
            await AsyncStorage.setItem("user", JSON.stringify(usuario));
            await AsyncStorage.setItem("token", token);
        }

        return usuario;
    } catch (error) {
        // 🛑 CRUCIAL: Lançar o erro (throw) para que o LoginScreen possa capturá-lo
        throw error; 
    }
  };

  const logout = async () => {
    setUser(null);
    delete api.defaults.headers.Authorization;
    if (Platform.OS !== "web") {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
    }
  };

  const updateUser = async (newUserData) => {
    setUser(newUserData);
    if (Platform.OS !== "web") {
      await AsyncStorage.setItem("user", JSON.stringify(newUserData));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;