import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    // Direciona para a tela de login/cadastro conforme a rota configurada
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Seção Central: Logo e Apresentação */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {/* Ícone de Arco e Flecha Vetorial em SVG */}
          <Svg width={120} height={120} viewBox="0 0 100 100" fill="none">
            <Path
              d="M30 25 C15 25 15 45 30 60 C45 75 60 85 70 90 C65 80 55 65 50 50 C45 35 45 25 30 25 Z"
              fill="#8B1A4A"
            />
            <Path
              d="M35 30 C22 30 22 47 35 60 C47 73 57 82 65 86 C61 77 52 64 47 50 C42 36 42 30 35 30 Z"
              fill="#4A0E1E"
            />
            <Path
              d="M20 75 L75 20"
              stroke="#ED1C24"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <Path
              d="M75 12 C70 12 67 15 67 18 C67 23 75 28 75 28 C75 28 83 23 83 18 C83 15 80 12 75 12 Z"
              fill="#ED1C24"
            />
            <Path
              d="M15 80 L25 80 M15 80 L15 70"
              stroke="#ED1C24"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </Svg>

          {/* Nome do Aplicativo */}
          <Text style={styles.brandTitle}>
            cupid<Text style={styles.brandAccent}>U</Text>
          </Text>
        </View>

        {/* Proposta da Plataforma */}
        <Text style={styles.description}>
          Conectando universitários com interesses em comum no ambiente
          acadêmico
        </Text>
      </View>

      {/* Botão de Ação do Rodapé */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.85}
          onPress={handleStart}
        >
          <Text style={styles.startButtonText}>Começar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A0E1E", // Tom Deep Bordeaux da paleta oficial
    paddingHorizontal: 32,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 52,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 12,
    letterSpacing: -1,
  },
  brandAccent: {
    color: "#E91E63", // Cor de destaque Rose
  },
  description: {
    fontSize: 18,
    color: "#FAF3EB", // Off-White
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 8,
    fontWeight: "400",
  },
  footer: {
    width: "100%",
    paddingBottom: 40,
    alignItems: "center",
  },
  startButton: {
    width: "100%",
    backgroundColor: "#E91E63", // Botão Rose
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
