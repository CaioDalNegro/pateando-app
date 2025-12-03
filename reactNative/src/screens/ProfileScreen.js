import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

// Componente para cada item do menu
const ProfileMenuItem = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <Ionicons name={icon} size={22} color={COLORS.primary} />
    </View>
    <Text style={styles.menuItemText}>{text}</Text>
    <Ionicons
      name="chevron-forward-outline"
      size={22}
      color={COLORS.textSecondary}
    />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  
  // Estados para estatísticas
  const [estatisticas, setEstatisticas] = useState({
    totalPasseios: 0,
    horasFormatadas: "0h",
    dogwalkerFavorito: "Nenhum",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Função para buscar estatísticas
  const fetchEstatisticas = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await api.get(`/usuarios/${user.id}/estatisticas`);
      setEstatisticas(response.data);
    } catch (error) {
      console.log("Erro ao buscar estatísticas:", error);
      // Manter valores padrão em caso de erro
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  // Buscar estatísticas ao montar o componente
  useEffect(() => {
    fetchEstatisticas();
  }, [fetchEstatisticas]);

  // Função para refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchEstatisticas();
  }, [fetchEstatisticas]);

  // Formatar data de criação do usuário (se disponível)
  const formatMemberSince = () => {
    // Se tiver a data de criação no user, usar ela
    // Por enquanto, usar data atual como placeholder
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const now = new Date();
    return `Membro desde ${meses[now.getMonth()]}, ${now.getFullYear()}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/68.jpg" }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{user?.nome || "Cliente"}</Text>
          <Text style={styles.profileMemberSince}>
            {formatMemberSince()}
          </Text>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{estatisticas.totalPasseios}</Text>
                <Text style={styles.statLabel}>Passeios</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{estatisticas.horasFormatadas}</Text>
                <Text style={styles.statLabel}>No total</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue} numberOfLines={1} ellipsizeMode="tail">
                  {estatisticas.dogwalkerFavorito}
                </Text>
                <Text style={styles.statLabel}>Walker Fav.</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.menuWrapper}>
          <ProfileMenuItem
            icon="person-outline"
            text="Editar Perfil"
            onPress={() => navigation.navigate("EditProfile")}
          />
          <ProfileMenuItem
            icon="paw-outline"
            text="Meus Pets"
            onPress={() => navigation.navigate("MyPets")}
          />
          <ProfileMenuItem
            icon="card-outline"
            text="Pagamentos"
            onPress={() => {}}
          />
          <ProfileMenuItem
            icon="help-circle-outline"
            text="Ajuda & Suporte"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  profileMemberSince: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 32,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    minHeight: 80,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    maxWidth: 100,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  menuWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  menuIconContainer: {
    backgroundColor: "rgba(255, 122, 45, 0.1)",
    borderRadius: 10,
    padding: 8,
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: 32,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "bold",
  },
});