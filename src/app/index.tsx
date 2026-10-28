import { CupidULogo } from "@/components/CupidULogo";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Usando o vetor em vez da imagem PNG/JPG */}
        <CupidULogo width={280} height={200} />

        <Text style={styles.subtitle}>
          Conectando universitários com interesses em comum no ambiente
          acadêmico
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Começar</Text>
        </TouchableOpacity>
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
