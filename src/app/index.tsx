import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Interface do perfil retornada do backend
interface UserProfile {
  name: string;
  age: number;
  course: string;
  campus: string;
  tags: string[];
  bio: string;
  image: string;
}

export default function ProfileScreen() {
  const router = useRouter();

  // Estados para os dados do perfil e carregamento
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulação de busca dos dados no backend/Supabase
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const data: UserProfile = {
          name: "Ana Clara",
          age: 20,
          course: "Ciência Da Computação",
          campus: "Campus Belém",
          tags: ["Sincera", "Gosta de jogos"],
          bio: "Amo tecnologia, música e bons bate-papos. Sempre disposta a conhecer novas coisas!",
          image:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500",
        };

        setUser(data);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  const handleEditProfile = () => {
    router.push("/completar-perfil");
  };

  const handleLogout = () => {
    router.replace("/login");
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#E91E63" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={{ color: "#FFF" }}>Perfil não encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Image
          source={require("@/assets/images/LOGO_HORIZONTAL_BRANCA.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Foto de Perfil */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user.image }} style={styles.avatar} />
        </View>

        {/* Nome */}
        <Text style={styles.name}>{user.name}</Text>

        {/* Detalhes */}
        <Text style={styles.details}>
          {user.age} anos * {user.course} * {user.campus}
        </Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {user.tags.map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        <View style={styles.bioContainer}>
          <Text style={styles.bioTitle}>Sobre mim</Text>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Feather
              name="log-out"
              size={20}
              color="#E91E63"
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  logo: {
    width: 120,
    height: 36,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E91E63",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  details: {
    fontSize: 15,
    color: "#D0D0D0",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 28,
  },
  tagBadge: {
    backgroundColor: "#E91E63",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  bioContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 36,
  },
  bioTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  bioText: {
    fontSize: 15,
    color: "#CCCCCC",
    lineHeight: 22,
  },
  actionsContainer: {
    width: "100%",
    gap: 16,
  },
  editButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },
  logoutButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: "#E91E63",
    fontSize: 18,
    fontWeight: "600",
  },
});
