import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../services/api";

export default function VerificacaoScreen() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<any>([]);
  const [timer, setTimer] = useState(45);

  const handleChangeText = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerificar = async () => {
    try {
      const codigo = otp.join("");

      if (codigo.length !== 6) {
        alert("Preencha os 6 dígitos do código");
        return;
      }

      const response = await api.post("/auth/verify-otp", {
        email,
        token: codigo,
      });

      console.log(response.data);

      router.push("/completar-perfil");
    } catch (error: any) {
      console.log(error.response?.data);

      alert(error.response?.data?.detail || "Código inválido");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#000000" />
          </TouchableOpacity>

          <Text style={styles.title}>Verificação de código</Text>

          <View style={styles.iconContainer}>
            <Feather name="mail" size={64} color="#000000" />
          </View>

          <Text style={styles.subtitle}>
            Enviamos um código de 6 dígitos para{"\n"}seu e-mail institucional
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                style={styles.otpCircle}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectTextOnFocus
              />
            ))}
          </View>

          <Text style={styles.timerText}>
            Reenviar código em 00:{timer.toString().padStart(2, "0")}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleVerificar}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>verificar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 30,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#333333",
    textAlign: "center",
    marginBottom: 35,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 25,
  },

  otpCircle: {
    width: 41,
    height: 43,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 2,
  },
  timerText: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#4A0E17",
    width: "70%",
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },
});
