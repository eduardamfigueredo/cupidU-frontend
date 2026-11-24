import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../services/api";

// Formato devolvido pelo backend (PerfilSerializer)
interface UserProfile {
  id: number;
  nome: string;
  idade: number;
  curso: string;
  campus: string;
  orientacao: string;
  estado_civil: string;
  bio: string;
  fotos: string[];
}

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fotoAtual, setFotoAtual] = useState(0);

  // Recarrega sempre que a tela ganha foco (ex.: depois de editar)
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function loadUserProfile() {
        try {
          setLoading(true);
          const response = await api.get("perfis/me/");
          console.log("PERFIL:", response.data);

          if (ativo) {
            setUser(response.data);
            setFotoAtual(0);
          }
        } catch (error: any) {
          console.log(
            "ERRO PERFIL:",
            error?.response?.status,
            error?.response?.data,
          );

          if (error?.response?.status === 404) {
            router.replace("/completar-perfil");
            return;
          }
          if (
            error?.response?.status === 401 ||
            error?.response?.status === 403
          ) {
            router.replace("/login");
            return;
          }
          if (ativo) setUser(null);
        } finally {
          if (ativo) setLoading(false);
        }
      }

      loadUserProfile();
      return () => {
        ativo = false;
      };
    }, [router]),
  );

  const handleEditProfile = () => {
    router.push({ pathname: "/completar-perfil", params: { modo: "editar" } });
  };

  const handleLogout = () => {
    router.push("/sair");
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

  // Orientação e estado civil viram "tags" (ignora as vazias)
  const tags = [user.orientacao, user.estado_civil].filter(Boolean);

  // Monta a linha de detalhes sem deixar "separadores" soltos
  const detalhes = [`${user.idade} anos`, user.curso, user.campus]
    .filter(Boolean)
    .join(" * ");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        {/* Foto principal */}
        <View style={styles.avatarContainer}>
          {user.fotos?.[fotoAtual] ? (
            <Image
              source={{ uri: user.fotos[fotoAtual] }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: "#333" }]} />
          )}
        </View>

        {/* Miniaturas para trocar a foto (só se houver mais de uma) */}
        {user.fotos?.length > 1 && (
          <View style={styles.thumbsRow}>
            {user.fotos.map((uri, i) => (
              <TouchableOpacity key={uri + i} onPress={() => setFotoAtual(i)}>
                <Image
                  source={{ uri }}
                  style={[styles.thumb, i === fotoAtual && styles.thumbAtiva]}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Nome */}
        <Text style={styles.name}>{user.nome}</Text>

        {/* Detalhes */}
        <Text style={styles.details}>{detalhes}</Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        {!!user.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bioTitle}>Sobre mim</Text>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        )}

        {/* Botões de ação */}
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

      {/* Barra de navegação inferior */}
      <View style={styles.bottomNav}>
        {/* Home / Feed */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => router.replace("/feed")}
        >
          <Ionicons name="home-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Aba Matches (Coração) */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/conversas" as any,
              params: { aba: "matches" },
            })
          }
        >
          <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Aba Conversas (Chat) */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/conversas" as any,
              params: { aba: "conversas" },
            })
          }
        >
          <Ionicons name="chatbox-outline" size={23} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Perfil (Ativa) */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
          <View style={[styles.navIconWrapper, styles.navIconActiveCircle]}>
            <Ionicons name="person-outline" size={24} color="#000000" />
          </View>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 32,
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
  thumbsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    opacity: 0.6,
  },
  thumbAtiva: {
    opacity: 1,
    borderWidth: 2,
    borderColor: "#E91E63",
  },
  bottomNav: {
    height: 66,
    backgroundColor: "#E91E63",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  navIconActiveCircle: {
    borderWidth: 2,
    borderColor: "#000000",
  },
});