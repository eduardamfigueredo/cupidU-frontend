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
  id: string; // canal_id
  nome: string;
  curso: string;
  foto: string;
  ultimaMensagem?: string;
  naoLidas?: number;
}

type AbaAtiva = "matches" | "conversas";

const FOTO_PADRAO =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400";

const INTERVALO_ATUALIZACAO_MS = 5000;

export default function MatchesConversasScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ aba?: string }>();

  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>(
    params.aba === "conversas" ? "conversas" : "matches",
  );
  const [listaMatches, setListaMatches] = useState<MatchItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Carrega ao ganhar foco (ex.: voltando do chat) e atualiza a cada poucos segundos
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      let temporizador: ReturnType<typeof setTimeout> | undefined;

      async function carregarMatches() {
        try {
          const response = await api.get("feed/matches/");
          const dadosApi = Array.isArray(response.data) ? response.data : [];

          if (ativo) {
            setListaMatches(
              dadosApi.map((item: any) => ({
                id: String(item.canal_id),
                nome: item.nome ?? "Estudante",
                curso: item.curso ?? "UNAMA",
                foto: item.foto || FOTO_PADRAO,
                ultimaMensagem: item.ultima_mensagem ?? undefined,
                naoLidas: item.nao_lidas ?? 0,
              })),
            );
          }
        } catch (erro: any) {
          console.log(
            "ERRO MATCHES:",
            erro?.response?.status,
            erro?.response?.data,
            `${erro?.config?.baseURL}${erro?.config?.url}`,
          );
          // Mantém a lista anterior em caso de falha momentânea
        } finally {
          if (ativo) {
            setCarregando(false);
            temporizador = setTimeout(
              carregarMatches,
              INTERVALO_ATUALIZACAO_MS,
            );
          }
        }
      }

      carregarMatches();

      return () => {
        ativo = false;
        if (temporizador) clearTimeout(temporizador);
      };
    }, []),
  );

  // Abre o chat do canal desse match
  const abrirChat = (item: MatchItem) => {
    router.push({
      pathname: "/chat" as any,
      params: {
        canalId: item.id,
        nomeParceiro: item.nome,
        fotoParceiro: item.foto,
      },
    });
  };

  // Na aba "conversas" aparece só quem já trocou mensagem
  const dadosExibidos =
    abaAtiva === "matches"
      ? listaMatches
      : listaMatches.filter((m) => Boolean(m.ultimaMensagem));

  const renderItem = ({ item }: { item: MatchItem }) => {
    const mostrarBadge = abaAtiva === "conversas" && (item.naoLidas ?? 0) > 0;

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
                ? `Estudante de ${item.curso}`
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

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => router.replace("/feed")}
        >
          <Ionicons name="home-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>

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
