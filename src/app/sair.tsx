import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

export default function LogoutScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível encerrar a sessão.";
      Alert.alert("Erro ao sair", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Feather name="log-out" size={80} color="#E91E63" />
        </View>

        <Text style={styles.title}>Sair da conta?</Text>

        <Text style={styles.subtitle}>
          Você será desconectado do app e precisará fazer login novamente para
          continuar
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.logoutButtonText}>Sair</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  card: {
    width: "100%",
    height: "72%",
    backgroundColor: "#222222",
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
    marginLeft: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: "#E0E0E0",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: "#E91E63",
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 10,
    minWidth: 148,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },
});
