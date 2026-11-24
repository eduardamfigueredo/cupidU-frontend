import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/services/api";

type Perfil = {
  id: number;
  nome: string;
  idade: number;
  curso: string;
  campus: string;
  orientacao: string;
  estado_civil: string;
  bio: string;
  fotos: string[];
};

type Acao = "LIKE" | "DISLIKE";

const { width } = Dimensions.get("window");
const LIMITE = width * 0.28;

const formatar = (t?: string) =>
  t ? t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, " ") : "";

export default function FeedScreen() {
  const router = useRouter();

  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [indice, setIndice] = useState(0);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [matchCom, setMatchCom] = useState<Perfil | null>(null);
  const [detalhe, setDetalhe] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const acaoRef = useRef<(a: Acao) => void>(() => {});

  const atual = perfis[indice];
  const fotos = atual?.fotos ?? [];

  const carregar = useCallback(async () => {
    try {
      const { data } = await api.get("feed/");
      setPerfis(data);
      setIndice(0);
      setFotoIdx(0);
    } catch (error: any) {
      console.log("ERRO FEED:", error?.response?.status, error?.response?.data);

      const status = error?.response?.status;
      if (
        error?.response?.data?.detail === "Complete seu perfil para ver o feed."
      ) {
        router.replace("/completar-perfil");
      } else if (status === 401 || status === 403) {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Recarrega ao entrar na aba (ex.: depois de responder curtidas)
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const resetar = () =>
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();

  const agir = (acao: Acao) => {
    if (!atual || enviando) return;

    const perfil = atual;
    setEnviando(true);

    Animated.timing(position, {
      toValue: { x: acao === "LIKE" ? width * 1.3 : -width * 1.3, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(async () => {
      try {
        const endpoint = acao === "LIKE" ? "flechar/" : "rejeitar/";
        const body =
          acao === "LIKE"
            ? { alvo_id: perfil.id, tipo: "LIKE" }
            : { alvo_id: perfil.id };

        const { data } = await api.post(endpoint, body);

        if (acao === "LIKE" && data?.match) setMatchCom(perfil);

        setIndice((i) => i + 1);
        setFotoIdx(0);
        // Traz o cartão de volta só depois que o próximo já foi montado
        requestAnimationFrame(() => position.setValue({ x: 0, y: 0 }));
      } catch (error: any) {
        console.log(
          "ERRO AO AGIR:",
          error?.response?.status,
          error?.response?.data,
        );
        resetar();

        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          router.replace("/login");
        } else {
          alert("Não foi possível registrar sua ação. Tente novamente.");
        }
      } finally {
        setEnviando(false);
      }
    });
  };
  acaoRef.current = agir;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) =>
        position.setValue({ x: g.dx, y: g.dy * 0.3 }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > LIMITE) acaoRef.current("LIKE");
        else if (g.dx < -LIMITE) acaoRef.current("DISLIKE");
        else resetar();
      },
      onPanResponderTerminate: () => resetar(),
    }),
  ).current;

  const rotacao = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ["-10deg", "0deg", "10deg"],
  });
  const opacidadeLike = position.x.interpolate({
    inputRange: [0, LIMITE],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const opacidadeNope = position.x.interpolate({
    inputRange: [-LIMITE, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const proxima = () => setFotoIdx((i) => Math.min(i + 1, fotos.length - 1));
  const anterior = () => setFotoIdx((i) => Math.max(i - 1, 0));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Image
          source={require("@/assets/images/LOGO_HORIZONTAL_BRANCA.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E91E63" />
        </View>
      ) : atual ? (
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate: rotacao },
                ],
              },
            ]}
            {...pan.panHandlers}
          >
            {fotos[fotoIdx] ? (
              <Image
                source={{ uri: fotos[fotoIdx] }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: "#2A1D22" },
                ]}
              />
            )}

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.92)"]}
              style={styles.gradient}
            />

            {/* Barrinhas de progresso das fotos */}
            {fotos.length > 1 && (
              <View style={styles.barras}>
                {fotos.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.barra, i === fotoIdx && styles.barraAtiva]}
                  />
                ))}
              </View>
            )}

            {/* Selos de curtir / rejeitar ao arrastar */}
            <Animated.View
              style={[styles.selo, styles.seloLike, { opacity: opacidadeLike }]}
            >
              <Text style={[styles.seloTxt, { color: "#4CE08A" }]}>CURTIR</Text>
            </Animated.View>
            <Animated.View
              style={[styles.selo, styles.seloNope, { opacity: opacidadeNope }]}
            >
              <Text style={[styles.seloTxt, { color: "#FF4D6D" }]}>NOPE</Text>
            </Animated.View>

            {/* Zonas de toque: esquerda = foto anterior, direita = próxima */}
            <View style={styles.zonas}>
              <Pressable style={{ flex: 1 }} onPress={anterior} />
              <Pressable style={{ flex: 1 }} onPress={proxima} />
            </View>

            {/* Informações: toque abre o perfil completo */}
            <Pressable style={styles.info} onPress={() => setDetalhe(true)}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.nome} numberOfLines={1}>
                  {atual.nome}
                  <Text style={styles.idade}> {atual.idade}</Text>
                </Text>
                <View style={styles.infoRow}>
                  <Ionicons name="school-outline" size={17} color="#FAF3EB" />
                  <Text style={styles.infoTxt} numberOfLines={1}>
                    {atual.curso}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={17} color="#FAF3EB" />
                  <Text style={styles.infoTxt} numberOfLines={1}>
                    {atual.campus}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="information-circle-outline"
                size={30}
                color="#FFFFFF"
              />
            </Pressable>
          </Animated.View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btnReject}
              onPress={() => agir("DISLIKE")}
              disabled={enviando}
              activeOpacity={0.8}
            >
              <Feather name="x" size={32} color="#E91E63" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnLike}
              onPress={() => agir("LIKE")}
              disabled={enviando}
              activeOpacity={0.8}
            >
              <Ionicons name="heart" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.center}>
          <Ionicons name="sparkles-outline" size={56} color="#E91E63" />
          <Text style={styles.vazioTitulo}>Você viu todo mundo por agora</Text>
          <Text style={styles.vazioTxt}>
            Volte mais tarde para conhecer novas pessoas do seu campus.
          </Text>
          <TouchableOpacity
            style={styles.reloadBtn}
            onPress={() => {
              setLoading(true);
              carregar();
            }}
          >
            <Text style={styles.reloadTxt}>Atualizar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Perfil completo */}
      <Modal
        visible={detalhe}
        animationType="slide"
        onRequestClose={() => setDetalhe(false)}
      >
        <View style={styles.detalhe}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {!!fotos[fotoIdx] && (
              <Image
                source={{ uri: fotos[fotoIdx] }}
                style={styles.detalheFoto}
              />
            )}

            <View style={styles.detalheCorpo}>
              <Text style={styles.detalheNome}>
                {atual?.nome}, {atual?.idade}
              </Text>

              <View style={styles.infoRow}>
                <Ionicons name="school-outline" size={18} color="#FAF3EB" />
                <Text style={styles.detalheTxt}>{atual?.curso}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color="#FAF3EB" />
                <Text style={styles.detalheTxt}>{atual?.campus}</Text>
              </View>

              <View style={styles.tags}>
                {!!atual?.orientacao && (
                  <View style={styles.tag}>
                    <Text style={styles.tagTxt}>
                      {formatar(atual.orientacao)}
                    </Text>
                  </View>
                )}
                {!!atual?.estado_civil && (
                  <View style={styles.tag}>
                    <Text style={styles.tagTxt}>
                      {formatar(atual.estado_civil)}
                    </Text>
                  </View>
                )}
              </View>

              {!!atual?.bio && (
                <>
                  <Text style={styles.detalheSecao}>Sobre</Text>
                  <Text style={styles.detalheBio}>{atual.bio}</Text>
                </>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.fechar}
            onPress={() => setDetalhe(false)}
            activeOpacity={0.8}
          >
            <Feather name="chevron-down" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Match */}
      <Modal
        visible={!!matchCom}
        transparent
        animationType="fade"
        onRequestClose={() => setMatchCom(null)}
      >
        <View style={styles.matchFundo}>
          <View style={styles.matchCard}>
            <Ionicons name="heart" size={56} color="#E91E63" />
            <Text style={styles.matchTitulo}>Deu match!</Text>
            <Text style={styles.matchTxt}>
              Você e {matchCom?.nome} curtiram um ao outro.
            </Text>

            <TouchableOpacity
              style={styles.matchPrimario}
              onPress={() => {
                setMatchCom(null);
                router.push("/chat");
              }}
            >
              <Text style={styles.matchPrimarioTxt}>Enviar mensagem</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMatchCom(null)}>
              <Text style={styles.matchSecundario}>Continuar navegando</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0709" },
  header: { height: 52, alignItems: "center", justifyContent: "center" },
  logo: { width: 130, height: 34 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  content: { flex: 1, paddingHorizontal: 12, paddingBottom: 8 },

  card: {
    flex: 1,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#1A1013",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "42%",
  },
  barras: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    gap: 4,
  },
  barra: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  barraAtiva: { backgroundColor: "#FFFFFF" },

  selo: {
    position: "absolute",
    top: 48,
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  seloLike: {
    left: 20,
    borderColor: "#4CE08A",
    transform: [{ rotate: "-14deg" }],
  },
  seloNope: {
    right: 20,
    borderColor: "#FF4D6D",
    transform: [{ rotate: "14deg" }],
  },
  seloTxt: { fontSize: 26, fontWeight: "900", letterSpacing: 2 },

  zonas: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 130,
    flexDirection: "row",
  },
  info: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  nome: { fontSize: 30, fontWeight: "800", color: "#FFFFFF" },
  idade: { fontSize: 25, fontWeight: "400", color: "#FAF3EB" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoTxt: { fontSize: 15, color: "#FAF3EB", flexShrink: 1 },

  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingTop: 12,
    paddingBottom: 4,
  },
  btnReject: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },
  btnLike: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },

  vazioTitulo: {
    color: "#FAF3EB",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  vazioTxt: {
    color: "#A99DA1",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  reloadBtn: {
    marginTop: 20,
    backgroundColor: "#E91E63",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
  },
  reloadTxt: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },

  detalhe: { flex: 1, backgroundColor: "#0D0709" },
  detalheFoto: { width: "100%", height: 460 },
  detalheCorpo: { padding: 20, gap: 10 },
  detalheNome: { fontSize: 28, fontWeight: "800", color: "#FFFFFF" },
  detalheTxt: { fontSize: 16, color: "#FAF3EB" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  tag: {
    borderWidth: 1,
    borderColor: "#E91E63",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagTxt: { color: "#FAF3EB", fontSize: 13, fontWeight: "600" },
  detalheSecao: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 12,
  },
  detalheBio: { color: "#E5DAD0", fontSize: 15, lineHeight: 22 },
  fechar: {
    position: "absolute",
    top: 48,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },

  matchFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  matchCard: {
    width: "100%",
    backgroundColor: "#1A1013",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  matchTitulo: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 12,
  },
  matchTxt: {
    color: "#CFC4C8",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  matchPrimario: {
    backgroundColor: "#E91E63",
    paddingVertical: 14,
    borderRadius: 24,
    alignSelf: "stretch",
    alignItems: "center",
  },
  matchPrimarioTxt: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  matchSecundario: {
    color: "#A99DA1",
    fontSize: 14,
    marginTop: 16,
    fontWeight: "600",
  },
});
