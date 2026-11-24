import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../services/api";

interface Mensagem {
  id: string;
  texto: string;
  enviadaPorMim: boolean;
}

export default function ChatScreen() {
  const router = useRouter();
  const listaRef = useRef<FlatList<Mensagem>>(null);

  const params = useLocalSearchParams<{
    idParceiro?: string;
    nomeParceiro?: string;
    fotoParceiro?: string;
  }>();

  const idParceiro = Array.isArray(params.idParceiro)
    ? params.idParceiro[0]
    : params.idParceiro;

  const nomeParceiro =
    (Array.isArray(params.nomeParceiro)
      ? params.nomeParceiro[0]
      : params.nomeParceiro) || "Conversa";

  const fotoParceiro = Array.isArray(params.fotoParceiro)
    ? params.fotoParceiro[0]
    : params.fotoParceiro;

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroHistorico, setErroHistorico] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [textoInput, setTextoInput] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");

  const carregarHistorico = useCallback(
    async (isMounted?: () => boolean, silencioso = false) => {
      if (!idParceiro) {
        if (!silencioso) {
          setCarregando(false);
          setErroHistorico("Identificador da conversa não encontrado.");
        }
        return;
      }

      try {
        if (!silencioso) {
          setCarregando(true);
          setErroHistorico(null);
        }

        const response = await api.get(`conversas/${idParceiro}/mensagens/`);
        const dados = Array.isArray(response.data) ? response.data : [];

        if (!isMounted || isMounted()) {
          const formatadas: Mensagem[] = dados.map((m: any) => ({
            id: String(m.id),
            texto: m.texto || m.conteudo || "",
            enviadaPorMim: Boolean(m.enviada_por_mim ?? m.remetente_eu),
          }));

          setMensagens((prev) => {
            const mudouTamanho = prev.length !== formatadas.length;
            const mudouUltima =
              prev[prev.length - 1]?.id !==
              formatadas[formatadas.length - 1]?.id;

            return mudouTamanho || mudouUltima ? formatadas : prev;
          });
        }
      } catch (error: any) {
        if (!silencioso && (!isMounted || isMounted())) {
          setMensagens([]);
          const detalhe =
            error?.response?.data?.detail ||
            "Não foi possível carregar as mensagens desta conversa.";
          setErroHistorico(detalhe);
        }
      } finally {
        if (!silencioso && (!isMounted || isMounted())) {
          setCarregando(false);
        }
      }
    },
    [idParceiro],
  );

  useEffect(() => {
    let ativo = true;

    carregarHistorico(() => ativo, false);

    const intervalo = setInterval(() => {
      carregarHistorico(() => ativo, true);
    }, 4000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [carregarHistorico]);

  const enviarMensagem = async () => {
    const conteudo = textoInput.trim();
    if (!conteudo || !idParceiro || enviando) return;

    try {
      setEnviando(true);
      const response = await api.post(`conversas/${idParceiro}/mensagens/`, {
        texto: conteudo,
      });

      const salva = response.data;
      const novaMensagem: Mensagem = {
        id: String(salva?.id ?? Date.now()),
        texto: salva?.texto || salva?.conteudo || conteudo,
        enviadaPorMim: true,
      };

      setMensagens((prev) => [...prev, novaMensagem]);
      setTextoInput("");

      setTimeout(() => {
        listaRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      const detalhe =
        error?.response?.data?.detail ||
        "Não foi possível enviar sua mensagem. Tente novamente.";
      Alert.alert("Erro ao enviar", detalhe);
    } finally {
      setEnviando(false);
    }
  };

  const mensagensFiltradas =
    buscando && termoBusca.trim().length > 0
      ? mensagens.filter((m) =>
          m.texto.toLowerCase().includes(termoBusca.trim().toLowerCase()),
        )
      : mensagens;

  const renderAvatar = (estilo: object) => {
    if (fotoParceiro) {
      return <Image source={{ uri: fotoParceiro }} style={estilo} />;
    }
    return (
      <View style={[estilo, styles.avatarPlaceholder]}>
        <Ionicons name="person" size={18} color="#9E9E9E" />
      </View>
    );
  };

  const renderMensagem = ({ item }: { item: Mensagem }) => {
    if (item.enviadaPorMim) {
      return (
        <View style={styles.sentRow}>
          <View style={styles.sentBubble}>
            <Text style={styles.messageText}>{item.texto}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.receivedRow}>
        {renderAvatar(styles.messageAvatar)}
        <View style={styles.receivedBubble}>
          <Text style={styles.messageText}>{item.texto}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="light" />

      {/* Cabeçalho do chat */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {renderAvatar(styles.headerAvatar)}

          <Text style={styles.headerName}>{nomeParceiro}</Text>
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          activeOpacity={0.7}
          onPress={() => {
            setBuscando((prev) => !prev);
            setTermoBusca("");
          }}
        >
          <Feather name={buscando ? "x" : "search"} size={21} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Barra opcional de pesquisa na conversa */}
      {buscando && (
        <View style={styles.searchBar}>
          <TextInput
            value={termoBusca}
            onChangeText={setTermoBusca}
            placeholder="Buscar na conversa..."
            placeholderTextColor="#9E9E9E"
            style={styles.searchInput}
            autoFocus
          />
        </View>
      )}

      {/* Lista de mensagens + Barra de digitação */}
      <KeyboardAvoidingView
        style={styles.chatBody}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {carregando ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
          </View>
        ) : erroHistorico ? (
          <View style={styles.centerContainer}>
            <Feather name="alert-circle" size={42} color="#E91E63" />
            <Text style={styles.errorText}>{erroHistorico}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              activeOpacity={0.8}
              onPress={() => carregarHistorico()}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={listaRef}
            data={mensagensFiltradas}
            keyExtractor={(item) => item.id}
            renderItem={renderMensagem}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhuma mensagem ainda. Diga oi para {nomeParceiro}!
              </Text>
            }
            onContentSizeChange={() =>
              listaRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Campo inferior de envio */}
        <View style={styles.inputBar}>
          <TextInput
            value={textoInput}
            onChangeText={setTextoInput}
            placeholder="Digite uma mensagem...."
            placeholderTextColor="#CCCCCC"
            style={styles.textInput}
            multiline
            editable={!enviando}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!textoInput.trim() || enviando) && styles.sendButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={enviarMensagem}
            disabled={!textoInput.trim() || enviando}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="paper-plane-outline"
                size={22}
                color="#FFFFFF"
                style={styles.sendIcon}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    height: 68,
    backgroundColor: "#1A1A1A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: "#2C2C2C",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  searchButton: {
    padding: 8,
  },
  searchBar: {
    backgroundColor: "#141414",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  searchInput: {
    backgroundColor: "#222222",
    color: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },
  chatBody: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    color: "#E0E0E0",
    fontSize: 15,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#E91E63",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 18,
  },
  emptyText: {
    color: "#9E9E9E",
    textAlign: "center",
    marginTop: 48,
    fontSize: 14,
  },
  receivedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    maxWidth: "82%",
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: "#2C2C2C",
  },
  receivedBubble: {
    backgroundColor: "#222222",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    flexShrink: 1,
  },
  sentRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  sentBubble: {
    backgroundColor: "#6B1333",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    maxWidth: "78%",
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },
  inputBar: {
    minHeight: 68,
    backgroundColor: "#1A1A1A",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    maxHeight: 100,
    paddingRight: 12,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.55,
  },
  sendIcon: {
    marginLeft: -2,
    marginTop: 1,
  },
});
