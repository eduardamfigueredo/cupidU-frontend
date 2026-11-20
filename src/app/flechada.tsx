import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Foto padrão do usuário logado para exibir no círculo esquerdo
const CURRENT_USER_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800";

export default function FlechadaScreen() {
  const router = useRouter();

  // Recebe os dados do perfil com quem deu flechada enviados pelo feed
  const params = useLocalSearchParams<{
    matchedImage?: string;
    matchedName?: string;
    matchedId?: string;
  }>();

  const partnerAvatar = Array.isArray(params.matchedImage)
    ? params.matchedImage[0]
    : params.matchedImage;

  const partnerName = Array.isArray(params.matchedName)
    ? params.matchedName[0]
    : params.matchedName;

  // Volta para a tela do feed para continuar vendo perfis
  const handleContinueSwiping = () => {
    router.back();
  };

  // Botão "Ir para o chat" (pronto para conectar quando a tela de chat for criada)
  const handleGoToChat = () => {
    console.log("Ir para o chat com:", partnerName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Seta de voltar no canto superior esquerdo */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleContinueSwiping}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Título principal */}
        <Text style={styles.title}>
          {"Vocês deram uma\nflechada mútua !"}
        </Text>

        {/* Duas fotos circulares com o ícone de arco e flecha rosa no centro */}
        <View style={styles.avatarsRow}>
          <Image
            source={{ uri: CURRENT_USER_AVATAR }}
            style={styles.avatar}
          />

          <Image
            source={{ uri: partnerAvatar || CURRENT_USER_AVATAR }}
            style={styles.avatar}
          />

          <View style={styles.arrowBadge}>
            <MaterialCommunityIcons
              name="bow-arrow"
              size={26}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Subtítulo */}
        <Text style={styles.subtitle}>
          {"Agora vocês podem\nconversar!"}
        </Text>

        {/* Botões de ação */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.btnChat}
            onPress={handleGoToChat}
            activeOpacity={0.85}
          >
            <Text style={styles.btnChatText}>Ir para o chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnContinue}
            onPress={handleContinueSwiping}
            activeOpacity={0.85}
          >
            <Text style={styles.btnContinueText}>Continuar vendo perfis</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3D0E1E",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: "flex-start",
  },
  backBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 38,
  },
  avatarsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    position: "relative",
  },
  avatar: {
    width: 142,
    height: 142,
    borderRadius: 71,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.75)",
  },
  arrowBadge: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#FAF3EB",
    textAlign: "center",
    lineHeight: 26,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  btnChat: {
    width: "82%",
    maxWidth: 320,
    backgroundColor: "#E91E63",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  btnChatText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
  },
  btnContinue: {
    width: "82%",
    maxWidth: 320,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContinueText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
  },
});