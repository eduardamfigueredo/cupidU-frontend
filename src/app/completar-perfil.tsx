import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../app/lib/supabase";
import { criarPerfil } from "../services/userService";

export default function CompletarPerfilScreen() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [curso, setCurso] = useState("");
  const [campus, setCampus] = useState("");
  const [orientacao, setOrientacao] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [bio, setBio] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);

  const selecionarFoto = async (index: number) => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      alert("Permissão negada");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!resultado.canceled) {
      console.log(resultado.assets[0]);
      const novasFotos = [...fotos];
      novasFotos[index] = resultado.assets[0].uri;

      setFotos(novasFotos);
    }
  };

  const uploadFoto = async (uri: string) => {
    console.log("URI:", uri);
    const response = await fetch(uri);
    console.log("STATUS:", response.status);
    console.log("CONTENT-TYPE:", response.headers.get("content-type"));

    const arrayBuffer = await response.arrayBuffer();
    console.log("TAMANHO:", arrayBuffer.byteLength);

    const nomeArquivo = `${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("perfil-fotos")
      .upload(nomeArquivo, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("perfil-fotos")
      .getPublicUrl(nomeArquivo);

    return data.publicUrl;
  };

  const handleFinalizar = async () => {
    try {
      if (!nome.trim()) {
        alert("Informe seu nome.");
        return;
      }

      if (!idade) {
        alert("Informe sua idade.");
        return;
      }

      if (fotos.length === 0) {
        alert("Selecione pelo menos uma foto.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("SESSION:", session);
      console.log("USER:", session?.user);

      const urlsFotos = await Promise.all(
        fotos.map((foto) => uploadFoto(foto)),
      );

      console.log("URLs geradas:", urlsFotos);

      const perfil = {
        nome,
        idade: Number(idade),
        curso,
        campus,
        orientacao,
        estado_civil: estadoCivil,
        bio,
        fotos: urlsFotos,
      };

      console.log("Perfil que será enviado:", perfil);

      const resposta = await criarPerfil(perfil);

      console.log("Perfil criado:", resposta);

      alert("Perfil criado com sucesso!");

      router.replace("/");
    } catch (error: any) {
      console.log("ERRO COMPLETO:", error);
      console.log("STATUS:", error?.response?.status);
      console.log("DATA:", error?.response?.data);

      alert(JSON.stringify(error?.response?.data));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" background-Color="#FFFFFF" />
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

          <Text style={styles.title}>Complete seu perfil</Text>
          <Text style={styles.subtitle}>
            Preencha as informações para continuar usando o app
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nome Completo"
              placeholderTextColor="#A0A0A0"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Idade"
              placeholderTextColor="#A0A0A0"
              value={idade}
              onChangeText={setIdade}
              keyboardType="numeric"
            />
            <Feather name="arrow-right" size={20} color="#000000" />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Curso"
              placeholderTextColor="#A0A0A0"
              value={curso}
              onChangeText={setCurso}
            />
            <Feather name="arrow-right" size={20} color="#000000" />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Campus"
              placeholderTextColor="#A0A0A0"
              value={campus}
              onChangeText={setCampus}
            />
            <Feather name="arrow-right" size={20} color="#000000" />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Orientação Sexual"
              placeholderTextColor="#A0A0A0"
              value={orientacao}
              onChangeText={setOrientacao}
            />
            <Feather name="arrow-right" size={20} color="#000000" />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Estado civil"
              placeholderTextColor="#A0A0A0"
              value={estadoCivil}
              onChangeText={setEstadoCivil}
            />
            <Feather name="arrow-right" size={20} color="#000000" />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Bio"
              value={bio}
              onChangeText={setBio}
            />
          </View>

          <Text style={styles.photoLabel}>fotos (min. 3)</Text>
          <View style={styles.photoGrid}>
            {[0, 1, 2, 3, 4].map((index) => (
              <TouchableOpacity
                key={index}
                style={styles.photoSlot}
                activeOpacity={0.7}
                onPress={() => selecionarFoto(index)}
              >
                {fotos[index] ? (
                  <Image
                    source={{ uri: fotos[index] }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 12,
                    }}
                  />
                ) : (
                  <Feather name="camera" size={22} color="#000000" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleFinalizar}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>continuar</Text>
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
    marginBottom: 15,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 25,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 25,
    height: 48,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#333333",
  },
  photoLabel: {
    fontSize: 11,
    color: "#333333",
    marginTop: 15,
    marginBottom: 10,
  },
  photoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 35,
  },
  photoSlot: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 10,
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
