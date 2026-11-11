import { Link } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Importando a imagem diretamente da pasta assets
const logoImg = require("@/assets/images/logo_cupidU.png");

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Renderizando o PNG */}
        <Image source={logoImg} style={styles.logo} resizeMode="contain" />

        <Text style={styles.subtitle}>
          Conectando universitários com interesses em comum no ambiente
          acadêmico
        </Text>

        <Link href="/login" asChild>
          <TouchableOpacity style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Começar</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A0E1E",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logo: {
    width: 280,
    height: 200,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
    marginTop: 20,
    marginBottom: 48,
    opacity: 0.9,
  },
  button: {
    backgroundColor: "#E91E63",
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
