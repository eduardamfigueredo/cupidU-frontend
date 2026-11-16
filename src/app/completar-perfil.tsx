import { Feather } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { supabase } from "../lib/supabase";
import { api } from "../services/api";
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
  const [fotos, setFotos] = useState<string[]>(["", "", "", "", ""]);
  const [salvando, setSalvando] = useState(false);
  const { modo } = useLocalSearchParams<{ modo?: string }>();
  const editando = modo === "editar";
  const [carregando, setCarregando] = useState(editando);

  useEffect(() => {
    if (!editando) return;

    async function carregarPerfil() {
      try {
        const { data } = await api.get("perfis/me/");
        setNome(data.nome ?? "");
        setIdade(String(data.idade ?? ""));
        setCurso(data.curso ?? "");
        setCampus(data.campus ?? "");
        setOrientacao(data.orientacao ?? "");
        setEstadoCivil(data.estado_civil ?? "");
        setBio(data.bio ?? "");

        // Preenche os 5 slots; os vazios ficam como ""
        const slots = ["", "", "", "", ""];
        (data.fotos ?? []).slice(0, 5).forEach((url: string, i: number) => {
          slots[i] = url;
        });
        setFotos(slots);
      } catch (error: any) {
        console.log("ERRO AO CARREGAR PERFIL:", error?.response?.data ?? error);
        alert("Não foi possível carregar seu perfil.");
        router.back();
      } finally {
        setCarregando(false);
      }
    }

    carregarPerfil();
  }, [editando]);

  const selecionarFoto = async (index: number) => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      alert("Permissão negada");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // MediaTypeOptions está deprecated
      allowsEditing: true,
      quality: 0.8,
    });

    if (!resultado.canceled) {
      const novasFotos = [...fotos];
      novasFotos[index] = resultado.assets[0].uri;
      setFotos(novasFotos);
    }
  };

  const uploadFoto = async (uri: string, index: number) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });

    const nomeArquivo = `${Date.now()}-${index}.jpg`;

    const { error } = await supabase.storage
      .from("perfil-fotos")
      .upload(nomeArquivo, decode(base64), {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("perfil-fotos")
      .getPublicUrl(nomeArquivo);

    return data.publicUrl;
  };

  const handleFinalizar = async () => {
    if (salvando) return;
    try {
      if (!nome.trim()) {
        alert("Informe seu nome.");
        return;
      }

      if (!idade) {
        alert("Informe sua idade.");
        return;
      }

      const fotosSelecionadas = fotos.filter(Boolean);

      if (fotosSelecionadas.length < 3) {
        alert("Selecione pelo menos 3 fotos.");
        return;
      }

      setSalvando(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Sua sessão expirou. Faça login novamente.");
        router.replace("/login");
        return;
      }

      // Fotos que já são URL (https) são mantidas; só as novas (file://) sobem
      const urlsFotos = await Promise.all(
        fotosSelecionadas.map((foto, i) =>
          foto.startsWith("http") ? foto : uploadFoto(foto, i),
        ),
      );

      const perfil = {
        nome: nome.trim(),
        idade: Number(idade),
        curso: curso.trim(),
        campus: campus.trim(),
        orientacao: orientacao.trim(),
        estado_civil: estadoCivil.trim(),
        bio: bio.trim(),
        fotos: urlsFotos,
      };

      if (editando) {
        await api.patch("perfis/me/", perfil);
        alert("Perfil atualizado!");
        router.replace("/perfil");
      } else {
        await criarPerfil(perfil);
        alert("Perfil criado com sucesso!");
        router.replace("/perfil");
      }
    } catch (error: any) {
      console.log("ERRO COMPLETO:", error);
      console.log("STATUS:", error?.response?.status);
      console.log("DATA:", error?.response?.data);

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        router.replace("/login");
        return;
      }

      alert(JSON.stringify(error?.response?.data ?? error?.message));
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#4A0E17" />
      </SafeAreaView>
    );
  }

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

          <Text style={styles.title}>
            {editando ? "Editar perfil" : "Complete seu perfil"}
          </Text>
          <Text style={styles.subtitle}>
            {editando
              ? "Atualize as informações do seu perfil"
              : "Preencha as informações para continuar usando o app"}
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
              placeholderTextColor="#A0A0A0"
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
              style={[styles.button, salvando && { opacity: 0.6 }]}
              onPress={handleFinalizar}
              disabled={salvando}
              activeOpacity={0.85}
            >
              {salvando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {editando ? "salvar" : "continuar"}
                </Text>
              )}
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
