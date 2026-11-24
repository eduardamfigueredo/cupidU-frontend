import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../services/api";

export interface MatchItem {
  id: string;
  nome: string;
  curso: string;
  foto: string;
  ultimaMensagem?: string;
  naoLidas?: number;
}

type AbaAtiva = "matches" | "conversas";

// Dados de fallback para visualização caso o endpoint de matches ainda esteja vazio
const MATCHES_FALLBACK: MatchItem[] = [
  {
    id: "1",
    nome: "Gabriel",
    curso: "Direito",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    ultimaMensagem: "Vamos marcar algo essa semana?",
    naoLidas: 1,
  },
  {
    id: "2",
    nome: "João Pedro",
    curso: "Cinema",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    ultimaMensagem: "Ahh, legal! 😂",
    naoLidas: 1,
  },
  {
    id: "3",
    nome: "Victor",
    curso: "Odontologia",
    foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    ultimaMensagem: "Top! Até mais :)",
    naoLidas: 1,
  },
  {
    id: "4",
    nome: "Júnior",
    curso: "Farmácia",
    foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
    ultimaMensagem: "Qual semestre você cursa?",
    naoLidas: 1,
  },
  {
    id: "5",
    nome: "Heitor",
    curso: "Administração",
    foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
    ultimaMensagem: "Você: Boa 😂",
    naoLidas: 0,
  },
  {
    id: "6",
    nome: "Lucas",
    curso: "Direito",
    foto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400",
    ultimaMensagem: "Você: Tô animada pra gente sair",
    naoLidas: 0,
  },
];

export default function MatchesConversasScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ aba?: string }>();

  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>(
    params.aba === "conversas" ? "conversas" : "matches",
  );
  const [listaMatches, setListaMatches] = useState<MatchItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarMatches() {
        try {
          setCarregando(true);
          // Busca os matches mútuos no backend
          const response = await api.get("matches/");
          const dadosApi = Array.isArray(response.data) ? response.data : [];

          if (ativo) {
            if (dadosApi.length > 0) {
              const formatados: MatchItem[] = dadosApi.map((item: any) => ({
                id: String(item.id || item.usuario_id || item.parceiro?.id),
                nome: item.nome || item.parceiro?.nome || "Estudante",
                curso: item.curso || item.parceiro?.curso || "UNAMA",
                foto:
                  item.foto ||
                  item.fotos?.[0] ||
                  item.parceiro?.fotos?.[0] ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
                ultimaMensagem: item.ultima_mensagem || "Vocês deram uma flechada!",
                naoLidas: item.nao_lidas ?? 0,
              }));
              setListaMatches(formatados);
            } else {
              setListaMatches(MATCHES_FALLBACK);
            }
          }
        } catch {
          // Usa o fallback enquanto a rota de matches não retorna dados
          if (ativo) {
            setListaMatches(MATCHES_FALLBACK);
          }
        } finally {
          if (ativo) setCarregando(false);
        }
      }

      carregarMatches();
      return () => {
        ativo = false;
      };
    }, []),
  );

  // Abre a tela de chat com os mesmos parâmetros usados em flechada.tsx
  const abrirChat = (item: MatchItem) => {
    router.push({
      pathname: "/chat" as any,
      params: {
        idParceiro: item.id,
        nomeParceiro: item.nome,
        fotoParceiro: item.foto,
      },
    });
  };

  // Filtra apenas quem já tem conversa iniciada na aba "conversas"
  const dadosExibidos =
    abaAtiva === "matches"
      ? listaMatches
      : listaMatches.filter((m) => Boolean(m.ultimaMensagem));

  const renderItem = ({ item }: { item: MatchItem }) => {
    const mostrarBadge =
      abaAtiva === "conversas" && (item.naoLidas ?? 0) > 0;

    return (
      <TouchableOpacity
        style={styles.itemRow}
        activeOpacity={0.75}
        onPress={() => abrirChat(item)}
      >
        <Image source={{ uri: item.foto }} style={styles.avatar} />

        <View style={styles.itemContent}>
          <View style={styles.itemTextBlock}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.nome}
            </Text>

            <Text style={styles.itemSubtitle} numberOfLines={1}>
              {abaAtiva === "matches"
                ? `Estudante de  ${item.curso}`
                : item.ultimaMensagem}
            </Text>
          </View>

          {mostrarBadge && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.naoLidas}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* Cabeçalho com logo centralizada e sino de notificações */}
      <View style={styles.header}>
        <View style={styles.headerSideSpacer} />

        <Image
          source={require("@/assets/images/LOGO_HORIZONTAL_BRANCA.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={styles.bellButton}
          activeOpacity={0.7}
          onPress={() => {}}
        >
          <Feather name="bell" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Seletor em pílula: matches | conversas */}
      <View style={styles.segmentWrapper}>
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              abaAtiva === "matches" && styles.segmentTabActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setAbaAtiva("matches")}
          >
            <Text
              style={[
                styles.segmentText,
                abaAtiva === "matches" && styles.segmentTextActive,
              ]}
            >
              matches
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentTab,
              abaAtiva === "conversas" && styles.segmentTabActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setAbaAtiva("conversas")}
          >
            <Text
              style={[
                styles.segmentText,
                abaAtiva === "conversas" && styles.segmentTextActive,
              ]}
            >
              conversas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de pessoas (matches ou conversas) */}
      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
        </View>
      ) : (
        <FlatList
          data={dadosExibidos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {abaAtiva === "matches"
                ? "Você ainda não tem flechadas mútuas."
                : "Nenhuma conversa iniciada ainda."}
            </Text>
          }
        />
      )}

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
          onPress={() => setAbaAtiva("matches")}
        >
          <View
            style={[
              styles.navIconWrapper,
              abaAtiva === "matches" && styles.navIconActiveCircle,
            ]}
          >
            <Ionicons
              name="heart-outline"
              size={24}
              color={abaAtiva === "matches" ? "#000000" : "#FFFFFF"}
            />
          </View>
        </TouchableOpacity>

        {/* Aba Conversas (Chat) */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => setAbaAtiva("conversas")}
        >
          <View
            style={[
              styles.navIconWrapper,
              abaAtiva === "conversas" && styles.navIconActiveCircle,
            ]}
          >
            <Ionicons
              name="chatbox-outline"
              size={23}
              color={abaAtiva === "conversas" ? "#000000" : "#FFFFFF"}
            />
          </View>
        </TouchableOpacity>

        {/* Perfil */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => router.push("/perfil")}
        >
          <Ionicons name="person-outline" size={24} color="#FFFFFF" />
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
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerSideSpacer: {
    width: 32,
  },
  logo: {
    width: 125,
    height: 36,
  },
  bellButton: {
    width: 32,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  segmentWrapper: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 22,
  },
  segmentContainer: {
    flexDirection: "row",
    width: 268,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#4A4A4A",
    overflow: "hidden",
  },
  segmentTab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },
  segmentTabActive: {
    backgroundColor: "#8A1C42",
  },
  segmentText: {
    color: "#E0E0E0",
    fontSize: 15,
    fontWeight: "400",
  },
  segmentTextActive: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginRight: 16,
    backgroundColor: "#2A2A2A",
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingBottom: 14,
    paddingTop: 4,
  },
  itemTextBlock: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  itemSubtitle: {
    color: "#D0D0D0",
    fontSize: 13,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E91E63",
    justifyContent: "center",
    alignItems: "center",
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    color: "#9E9E9E",
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
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