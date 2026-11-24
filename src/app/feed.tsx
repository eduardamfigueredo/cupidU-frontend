import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Importa a interface do perfil e os serviços de dados
import { Profile } from "@/data/mockProfiles";
import { fetchFeedProfiles, registerInteraction } from "@/services/userService";

// Largura da tela do dispositivo e distância mínima para confirmar o arraste
const { width: LARGURA_TELA } = Dimensions.get("window");
const LIMITE_ARRASTE = LARGURA_TELA * 0.25;

export default function FeedScreen() {
  const roteador = useRouter();

  // Guarda a lista de perfis
  const [perfis, definirPerfis] = useState<Profile[]>([]);

  // Índice do perfil visível na pilha
  const [indiceAtual, definirIndiceAtual] = useState(0);

  // Posição animada do cartão ao arrastar
  const posicaoCartao = useRef(new Animated.ValueXY()).current;

  // Carrega os dados na montagem da tela
  useEffect(() => {
    fetchFeedProfiles().then((dados: Profile[]) => definirPerfis(dados));
  }, []);

  // Processa o arraste ou clique de Like/Dislike
  const lidarComDeslize = async (direcao: "right" | "left") => {
    const perfilAtual = perfis[indiceAtual];

    // Reseta a posição do cartão e avança para o próximo perfil
    posicaoCartao.setValue({ x: 0, y: 0 });
    definirIndiceAtual((anterior) => anterior + 1);

    if (perfilAtual) {
      const acao = direcao === "right" ? "LIKE" : "DISLIKE";
      const resultado = await registerInteraction(perfilAtual.id, acao);

      // Ao arrastar para o lado direito e dar flechada, abre a tela /flechada
      if (direcao === "right" && resultado?.matched) {
        roteador.push({
          pathname: "/flechada" as any,
          params: {
            fotoParceiro: perfilAtual.image,
            nomeParceiro: perfilAtual.name,
            idParceiro: perfilAtual.id,
          },
        });
      }
    }
  };

  // Mantém a referência atualizada da função para o gesto de arrastar
  const lidarComDeslizeRef = useRef(lidarComDeslize);
  lidarComDeslizeRef.current = lidarComDeslize;

  // Configura o gesto de arrastar o cartão para os lados
  const controladorArraste = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, estadoGesto) =>
        Math.abs(estadoGesto.dx) > 10,
      onPanResponderMove: (_, estadoGesto) => {
        posicaoCartao.setValue({
          x: estadoGesto.dx,
          y: estadoGesto.dy * 0.2,
        });
      },
      onPanResponderRelease: (_, estadoGesto) => {
        if (estadoGesto.dx > LIMITE_ARRASTE) {
          Animated.timing(posicaoCartao, {
            toValue: { x: LARGURA_TELA + 100, y: estadoGesto.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => lidarComDeslizeRef.current("right"));
        } else if (estadoGesto.dx < -LIMITE_ARRASTE) {
          Animated.timing(posicaoCartao, {
            toValue: { x: -LARGURA_TELA - 100, y: estadoGesto.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => lidarComDeslizeRef.current("left"));
        } else {
          Animated.spring(posicaoCartao, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  // Inclinação suave enquanto arrasta o cartão
  const rotacaoCartao = posicaoCartao.x.interpolate({
    inputRange: [-LARGURA_TELA / 2, 0, LARGURA_TELA / 2],
    outputRange: ["-8deg", "0deg", "8deg"],
    extrapolate: "clamp",
  });

  // Obtém o perfil atual
  const perfilAtual = perfis[indiceAtual];

  return (
    <SafeAreaView style={estilos.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* Topo com o Logo PNG Oficial */}
      <View style={estilos.cabecalho}>
        <Image
          source={require("@/assets/images/LOGO_HORIZONTAL_BRANCA.png")}
          style={estilos.logo}
          resizeMode="contain"
        />
      </View>

      {/* Exibe o cartão se houver perfis disponíveis */}
      {perfilAtual ? (
        <View style={estilos.conteudo}>
          {/* Cartão principal do feed com gesto de arrastar */}
          <Animated.View
            {...controladorArraste.panHandlers}
            style={[
              estilos.cartao,
              {
                transform: [
                  { translateX: posicaoCartao.x },
                  { translateY: posicaoCartao.y },
                  { rotate: rotacaoCartao },
                ],
              },
            ]}
          >
            {/* Foto principal centralizada */}
            <View style={estilos.wrapperImagem} pointerEvents="none">
              <Image
                source={{ uri: perfilAtual.image }}
                style={estilos.imagemCartao}
              />
            </View>

            {/* Nome e Idade */}
            <Text style={estilos.nome}>
              {perfilAtual.name}, {perfilAtual.age}
            </Text>

            {/* Dados acadêmicos e status */}
            <View style={estilos.containerInfo}>
              <View style={estilos.linhaInfo}>
                <Ionicons name="journal-outline" size={20} color="#FAF3EB" />
                <Text style={estilos.textoInfo}>{perfilAtual.course}</Text>
              </View>

              <View style={estilos.linhaInfo}>
                <Ionicons name="location-outline" size={20} color="#FAF3EB" />
                <Text style={estilos.textoInfo}>{perfilAtual.campus}</Text>
              </View>

              <View style={estilos.linhaInfo}>
                <Ionicons name="heart-outline" size={20} color="#FAF3EB" />
                <Text style={estilos.textoInfo}>{perfilAtual.status}</Text>
              </View>
            </View>

            {/* Botões de Ação */}
            <View style={estilos.acoes}>
              {/* Botão Rejeitar (X com borda Rosa) */}
              <TouchableOpacity
                style={estilos.botaoRejeitar}
                onPress={() => lidarComDeslize("left")}
                activeOpacity={0.8}
              >
                <Feather name="x" size={40} color="#E91E63" />
              </TouchableOpacity>

              {/* Botão Curtir (Coração preenchido em Rosa) */}
              <TouchableOpacity
                style={estilos.botaoCurtir}
                onPress={() => lidarComDeslize("right")}
                activeOpacity={0.8}
              >
                <Ionicons name="heart" size={36} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      ) : (
        // Estado Vazio
        <View style={estilos.vazio}>
          <Ionicons name="sparkles-outline" size={56} color="#E91E63" />
          <Text style={estilos.textoVazio}>Sem novos perfis por enquanto!</Text>
          <TouchableOpacity
            style={estilos.botaoRecarregar}
            onPress={() => definirIndiceAtual(0)}
          >
            <Text style={estilos.textoBotaoRecarregar}>Reiniciar Feed</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Barra de navegação inferior */}
      <View style={estilos.bottomNav}>
        {/* Home / Feed (Ativa) */}
        <TouchableOpacity style={estilos.navItem} activeOpacity={0.8}>
          <View style={[estilos.navIconWrapper, estilos.navIconActiveCircle]}>
            <Ionicons name="home-outline" size={24} color="#000000" />
          </View>
        </TouchableOpacity>

        {/* Aba Matches (Coração) */}
        <TouchableOpacity
          style={estilos.navItem}
          activeOpacity={0.8}
          onPress={() =>
            roteador.push({
              pathname: "/conversas" as any,
              params: { aba: "matches" },
            })
          }
        >
          <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Aba Conversas (Chat) */}
        <TouchableOpacity
          style={estilos.navItem}
          activeOpacity={0.8}
          onPress={() =>
            roteador.push({
              pathname: "/conversas" as any,
              params: { aba: "conversas" },
            })
          }
        >
          <Ionicons name="chatbox-outline" size={23} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Perfil */}
        <TouchableOpacity
          style={estilos.navItem}
          activeOpacity={0.8}
          onPress={() => roteador.push("/perfil" as any)}
        >
          <Ionicons name="person-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0709",
  },
  cabecalho: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  logo: {
    width: 140,
    height: 38,
  },
  conteudo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  cartao: {
    width: LARGURA_TELA * 0.9,
    flex: 1,
    maxHeight: 600,
    backgroundColor: "#0D0709",
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: "flex-start",
  },
  wrapperImagem: {
    width: "100%",
    height: "50%",
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 14,
  },
  imagemCartao: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  nome: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FAF3EB",
    marginBottom: 12,
    marginLeft: 4,
  },
  containerInfo: {
    width: "100%",
    gap: 8,
    marginBottom: 16,
    paddingLeft: 4,
  },
  linhaInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  textoInfo: {
    fontSize: 16,
    color: "#FAF3EB",
    marginLeft: 12,
    fontWeight: "400",
  },
  acoes: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 28,
    marginTop: "auto",
    paddingBottom: 12,
  },
  botaoRejeitar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#E91E63",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoCurtir: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },
  vazio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  textoVazio: {
    color: "#FAF3EB",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  botaoRecarregar: {
    marginTop: 20,
    backgroundColor: "#E91E63",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  textoBotaoRecarregar: {
    color: "#FFFFFF",
    fontWeight: "700",
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
