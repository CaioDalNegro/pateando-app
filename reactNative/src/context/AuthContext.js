import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export const AuthContext = React.createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // ✅ Começa como false

  // ✅ REMOVIDO: Auto-login do AsyncStorage
  // Agora o app sempre inicia na tela de login

  const login = async (email, password) => {
    try {
        const response = await api.post("/usuarios/login", {
            email,
            senha: password,
        });

        const apiData = response.data;
        
        let token = apiData.token || apiData.accessToken || apiData.jwt || apiData.idToken;
        
        if (!token && response.headers && response.headers.authorization) {
            const header = response.headers.authorization;
            if (header.startsWith('Bearer ')) {
                token = header.substring(7);
            } else {
                token = header;
            }
        }
        
        const usuario = apiData.usuario || apiData.user || apiData; 
        
        if (usuario && typeof usuario === 'object' && !Array.isArray(usuario) && !token) {
            console.warn("⚠️ Token de segurança ausente! Usando token dummy para DEV.");
            token = 'FAKE_TOKEN_FOR_DEV_ONLY'; 
        }
        
        if (!usuario || typeof usuario !== 'object' || Array.isArray(usuario)) {
             console.error("Dados de usuário incompletos na resposta da API:", {
                 dadosRecebidos: apiData,
                 tokenTentado: token,
                 usuarioTentado: usuario
             });
             throw new Error("Login bem-sucedido, mas dados de usuário incompletos ou inválidos.");
        }
        
        api.defaults.headers.Authorization = `Bearer ${token}`;
        
        setUser(usuario);

        // Ainda salva no AsyncStorage (para uso futuro se quiser reativar auto-login)
        if (Platform.OS !== "web") {
            await AsyncStorage.setItem("user", JSON.stringify(usuario));
            await AsyncStorage.setItem("token", token);
        }

        return usuario;
    } catch (error) {
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