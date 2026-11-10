import { Feather, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Importa a interface do perfil e os serviços de dados
import { Profile } from "@/data/mockProfiles";
import { fetchFeedProfiles, registerInteraction } from "@/services/userService";

// Largura da tela do dispositivo
const { width } = Dimensions.get("window");

export default function FeedScreen() {
  // Guarda a lista de perfis
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Índice do perfil visível na pilha
  const [currentIndex, setCurrentIndex] = useState(0);

  // Carrega os dados na montagem da tela
  useEffect(() => {
    fetchFeedProfiles().then((data: Profile[]) => setProfiles(data));
  }, []);

  // Processa o clique de Like/Dislike
  const handleSwipe = (direction: "right" | "left") => {
    const current = profiles[currentIndex];

    if (current) {
      const action = direction === "right" ? "LIKE" : "DISLIKE";
      registerInteraction(current.id, action);
    }

    // Avança para o próximo perfil
    setCurrentIndex((prev) => prev + 1);
  };

  // Obtém o perfil atual
  const current = profiles[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Topo com o Logo PNG Oficial */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/LOGO_HORIZONTAL_BRANCA.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Exibe o cartão se houver perfis disponíveis */}
      {current ? (
        <View style={styles.content}>
          {/* Cartão principal do feed */}
          <View style={styles.card}>
            {/* Foto principal centralizada */}
            <View style={styles.imageWrapper}>
              <Image source={{ uri: current.image }} style={styles.cardImg} />
            </View>

            {/* Nome e Idade */}
            <Text style={styles.name}>
              {current.name}, {current.age}
            </Text>

            {/* Dados acadêmicos e status */}
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Ionicons name="journal-outline" size={20} color="#FAF3EB" />
                <Text style={styles.infoText}>{current.course}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#FAF3EB" />
                <Text style={styles.infoText}>{current.campus}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="heart-outline" size={20} color="#FAF3EB" />
                <Text style={styles.infoText}>{current.status}</Text>
              </View>
            </View>

            {/* Botões de Ação */}
            <View style={styles.actions}>
              {/* Botão Rejeitar (X com borda Rosa) */}
              <TouchableOpacity
                style={styles.btnReject}
                onPress={() => handleSwipe("left")}
                activeOpacity={0.8}
              >
                <Feather name="x" size={40} color="#E91E63" />
              </TouchableOpacity>

              {/* Botão Curtir (Coração preenchido em Rosa) */}
              <TouchableOpacity
                style={styles.btnLike}
                onPress={() => handleSwipe("right")}
                activeOpacity={0.8}
              >
                <Ionicons name="heart" size={36} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        // Estado Vazio
        <View style={styles.empty}>
          <Ionicons name="sparkles-outline" size={56} color="#E91E63" />
          <Text style={styles.emptyText}>Sem novos perfis por enquanto!</Text>
          <TouchableOpacity
            style={styles.reloadBtn}
            onPress={() => setCurrentIndex(0)}
          >
            <Text style={styles.reloadBtnText}>Reiniciar Feed</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0709", // Fundo escuro do cartão/tela
  },
  header: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  logo: {
    width: 140,
    height: 38,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: width * 0.9,
    flex: 1,
    maxHeight: 640,
    backgroundColor: "#0D0709",
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: "flex-start",
  },
  imageWrapper: {
    width: "100%",
    height: "54%",
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FAF3EB",
    marginBottom: 14,
    marginLeft: 4,
  },
  infoContainer: {
    width: "100%",
    gap: 10,
    marginBottom: 20,
    paddingLeft: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#FAF3EB",
    marginLeft: 12,
    fontWeight: "400",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 28,
    marginTop: "auto",
    paddingBottom: 16,
  },
  btnReject: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: "#E91E63",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  btnLike: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    color: "#FAF3EB",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  reloadBtn: {
    marginTop: 20,
    backgroundColor: "#E91E63",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  reloadBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
