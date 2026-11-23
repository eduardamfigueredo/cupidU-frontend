import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";

// Fallback caso o usuário ainda não tenha foto salva no cadastro
const FOTO_PADRAO_USUARIO =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800";

export default function FlechadaScreen() {
  const roteador = useRouter();

  // Recebe os dados do perfil com quem deu flechada enviados pelo feed
  const parametros = useLocalSearchParams<{
    fotoParceiro?: string;
    nomeParceiro?: string;
    idParceiro?: string;
  }>();

  const fotoParceiro = Array.isArray(parametros.fotoParceiro)
    ? parametros.fotoParceiro[0]
    : parametros.fotoParceiro;

  const nomeParceiro = Array.isArray(parametros.nomeParceiro)
    ? parametros.nomeParceiro[0]
    : parametros.nomeParceiro;

  const idParceiro = Array.isArray(parametros.idParceiro)
    ? parametros.idParceiro[0]
    : parametros.idParceiro;

  // Estado que guarda a foto de perfil do usuário logado
  const [fotoUsuarioLogado, definirFotoUsuarioLogado] =
    useState<string>(FOTO_PADRAO_USUARIO);

  // Busca a foto de perfil real do usuário logado no Supabase
  useEffect(() => {
    const carregarFotoUsuario = async () => {
      try {
        const {
          data: { user: usuario },
        } = await supabase.auth.getUser();

        if (!usuario) return;

        const fotoMetadados =
          usuario.user_metadata?.avatar_url ||
          usuario.user_metadata?.foto_url ||
          usuario.user_metadata?.image;

        if (fotoMetadados) {
          definirFotoUsuarioLogado(fotoMetadados);
          return;
        }

        const { data: dadosPerfil } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", usuario.id)
          .maybeSingle();

        const fotoBanco =
          dadosPerfil?.avatar_url ||
          dadosPerfil?.foto_url ||
          dadosPerfil?.image ||
          dadosPerfil?.photo_url;

        if (fotoBanco) {
          definirFotoUsuarioLogado(fotoBanco);
        }
      } catch {
        // Mantém o fallback caso esteja testando sem sessão ativa
      }
    };

    carregarFotoUsuario();
  }, []);

  // Volta para o feed para continuar vendo perfis
  const aoContinuarVendoPerfis = () => {
    roteador.back();
  };

  // Caminho pronto para a futura tela de chat que será criada depois
  const aoIrParaChat = () => {
    roteador.push({
      pathname: "/chat" as any,
      params: {
        idParceiro,
        nomeParceiro,
        fotoParceiro,
      },
    });
  };

  return (
    <SafeAreaView style={estilos.container}>
      <StatusBar style="light" />

      {/* Seta de voltar no canto superior esquerdo */}
      <View style={estilos.cabecalho}>
        <TouchableOpacity
          onPress={aoContinuarVendoPerfis}
          style={estilos.botaoVoltar}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={estilos.conteudo}>
        {/* Título principal */}
        <Text style={estilos.titulo}>
          {"Vocês deram uma\nflechada mútua !"}
        </Text>

        {/* Fotos de perfil dos dois usuários com o ícone de arco e flecha no centro */}
        <View style={estilos.linhaAvatares}>
          <Image
            source={{ uri: fotoUsuarioLogado }}
            style={estilos.avatar}
          />

          <Image
            source={{ uri: fotoParceiro || FOTO_PADRAO_USUARIO }}
            style={estilos.avatar}
          />

          <View style={estilos.emblemaFlecha}>
            <MaterialCommunityIcons
              name="bow-arrow"
              size={26}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Subtítulo */}
        <Text style={estilos.subtitulo}>
          {"Agora vocês podem\nconversar!"}
        </Text>

        {/* Botões de ação */}
        <View style={estilos.containerBotoes}>
          <TouchableOpacity
            style={estilos.botaoChat}
            onPress={aoIrParaChat}
            activeOpacity={0.85}
          >
            <Text style={estilos.textoBotaoChat}>Ir para o chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.botaoContinuar}
            onPress={aoContinuarVendoPerfis}
            activeOpacity={0.85}
          >
            <Text style={estilos.textoBotaoContinuar}>
              Continuar vendo perfis
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3D0E1E",
  },
  cabecalho: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: "flex-start",
  },
  botaoVoltar: {
    padding: 8,
  },
  conteudo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 38,
  },
  linhaAvatares: {
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
  emblemaFlecha: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  subtitulo: {
    fontSize: 18,
    color: "#FAF3EB",
    textAlign: "center",
    lineHeight: 26,
  },
  containerBotoes: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  botaoChat: {
    width: "82%",
    maxWidth: 320,
    backgroundColor: "#E91E63",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotaoChat: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
  },
  botaoContinuar: {
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
  textoBotaoContinuar: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
  },
});