import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
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

const FOTO_FALLBACK =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400";

const INTERVALO_ATUALIZACAO_MS = 4000;

const primeiro = (valor?: string | string[]) =>
  Array.isArray(valor) ? valor[0] : valor;

const converter = (m: any): Mensagem => ({
  id: String(m.id),
  texto: m.texto ?? "",
  enviadaPorMim: Boolean(m.enviada_por_mim),
});

export default function ChatScreen() {
  const router = useRouter();
  const listaRef = useRef<FlatList<Mensagem>>(null);

  const params = useLocalSearchParams<{
    canalId?: string;
    nomeParceiro?: string;
    fotoParceiro?: string;
  }>();

  const canalId = primeiro(params.canalId);
  const nomeParceiro = primeiro(params.nomeParceiro) || "Conversa";
  const fotoParceiro = primeiro(params.fotoParceiro) || FOTO_FALLBACK;

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [textoInput, setTextoInput] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");

  // Maior id de mensagem já recebido (usado para buscar só as novas)
  const ultimoIdRef = useRef(0);
  const enviandoRef = useRef(false);

  // Junta mensagens novas sem duplicar (o polling e o envio podem trazer a mesma)
  const adicionarMensagens = (recebidas: any[]) => {
    if (recebidas.length === 0) return;

    ultimoIdRef.current = Math.max(
      ultimoIdRef.current,
      ...recebidas.map((m) => Number(m.id)),
    );

    setMensagens((anteriores) => {
      const ids = new Set(anteriores.map((m) => m.id));
      const novas = recebidas.map(converter).filter((m) => !ids.has(m.id));
      return novas.length > 0 ? [...anteriores, ...novas] : anteriores;
    });
  };

  // Carrega o histórico e depois atualiza a cada poucos segundos
  useEffect(() => {
    if (!canalId) {
      setCarregando(false);
      return;
    }

    let ativo = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    const buscar = async () => {
      try {
        const resposta = await api.get(`feed/canais/${canalId}/mensagens/`, {
          params: ultimoIdRef.current
            ? { depois: ultimoIdRef.current }
            : undefined,
        });
        if (ativo && Array.isArray(resposta.data)) {
          adicionarMensagens(resposta.data);
        }
      } catch {
        // Falha momentânea de rede: tenta de novo no próximo ciclo
      } finally {
        if (ativo) {
          setCarregando(false);
          temporizador = setTimeout(buscar, INTERVALO_ATUALIZACAO_MS);
        }
      }
    };

    buscar();

    return () => {
      ativo = false;
      if (temporizador) clearTimeout(temporizador);
    };
  }, [canalId]);

  const enviarMensagem = async () => {
    const conteudo = textoInput.trim();
    if (!conteudo || !canalId || enviandoRef.current) return;

    enviandoRef.current = true;
    setTextoInput("");

    try {
      const resposta = await api.post(`feed/canais/${canalId}/mensagens/`, {
        texto: conteudo,
      });
      adicionarMensagens([resposta.data]);
    } catch {
      // Devolve o texto ao campo para o usuário tentar de novo
      setTextoInput(conteudo);
      Alert.alert("Ops!", "Não foi possível enviar a mensagem.");
    } finally {
      enviandoRef.current = false;
    }
  };

  const mensagensFiltradas =
    buscando && termoBusca.trim().length > 0
      ? mensagens.filter((m) =>
          m.texto.toLowerCase().includes(termoBusca.trim().toLowerCase()),
        )
      : mensagens;

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
        <Image source={{ uri: fotoParceiro }} style={styles.messageAvatar} />
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

          <Image source={{ uri: fotoParceiro }} style={styles.headerAvatar} />

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
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#E91E63" />
          </View>
        ) : (
          <FlatList
            ref={listaRef}
            data={mensagensFiltradas}
            keyExtractor={(item) => item.id}
            renderItem={renderMensagem}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              listaRef.current?.scrollToEnd({ animated: true })
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
            maxLength={2000}
          />

          <TouchableOpacity
            style={styles.sendButton}
            activeOpacity={0.8}
            onPress={enviarMensagem}
          >
            <Ionicons
              name="paper-plane-outline"
              size={22}
              color="#FFFFFF"
              style={styles.sendIcon}
            />
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
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 18,
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
  sendIcon: {
    marginLeft: -2,
    marginTop: 1,
  },
});
