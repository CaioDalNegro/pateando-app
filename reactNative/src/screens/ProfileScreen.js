import React, { useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";
import { AuthContext } from "../context/AuthContext";

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/68.jpg" }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{user?.nome || "Cliente"}</Text>
          <Text style={styles.profileMemberSince}>
            Membro desde Outubro, 2025
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Passeios</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>8h</Text>
            <Text style={styles.statLabel}>No total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>Maria C.</Text>
            <Text style={styles.statLabel}>Walker Fav.</Text>
          </View>
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
    marginBottom: 32,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
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
