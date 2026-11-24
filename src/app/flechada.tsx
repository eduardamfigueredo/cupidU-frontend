import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../services/api";

// Usado só se o parceiro não tiver foto
const FOTO_PADRAO_PARCEIRO =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800";

const primeiro = (valor?: string | string[]) =>
  Array.isArray(valor) ? valor[0] : valor;

export default function FlechadaScreen() {
  const roteador = useRouter();

  // Dados do match enviados pelo feed
  const parametros = useLocalSearchParams<{
    fotoParceiro?: string;
    nomeParceiro?: string;
    canalId?: string;
  }>();

  const fotoParceiro = primeiro(parametros.fotoParceiro);
  const nomeParceiro = primeiro(parametros.nomeParceiro);
  const canalId = primeiro(parametros.canalId);

  // Foto do usuário logado (null enquanto carrega)
  const [fotoUsuarioLogado, definirFotoUsuarioLogado] = useState<string | null>(
    null,
  );

  // Busca a foto real no seu perfil, no backend Django
  useEffect(() => {
    let ativo = true;

    const carregarFotoUsuario = async () => {
      try {
        const resposta = await api.get("perfis/me/");
        const foto = resposta.data?.fotos?.[0];

        if (ativo && foto) {
          definirFotoUsuarioLogado(foto);
        }
      } catch (erro: any) {
        console.log(
          "ERRO FOTO PERFIL:",
          erro?.response?.status,
          erro?.response?.data,
        );
      }
    };

    carregarFotoUsuario();

    return () => {
      ativo = false;
    };
  }, []);

  // Volta para o feed para continuar vendo perfis
  const aoContinuarVendoPerfis = () => {
    roteador.back();
  };

  // Abre o chat e remove esta tela do histórico
  const aoIrParaChat = () => {
    roteador.replace({
      pathname: "/chat" as any,
      params: {
        canalId,
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

        {/* Fotos dos dois usuários com o ícone de arco e flecha no centro */}
        <View style={estilos.linhaAvatares}>
          {fotoUsuarioLogado ? (
            <Image source={{ uri: fotoUsuarioLogado }} style={estilos.avatar} />
          ) : (
            <View style={[estilos.avatar, estilos.avatarCarregando]}>
              <Ionicons
                name="person"
                size={56}
                color="rgba(255, 255, 255, 0.4)"
              />
            </View>
          )}

          <Image
            source={{ uri: fotoParceiro || FOTO_PADRAO_PARCEIRO }}
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
        <Text style={estilos.subtitulo}>{"Agora vocês podem\nconversar!"}</Text>

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
  avatarCarregando: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
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
