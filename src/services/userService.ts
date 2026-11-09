import AsyncStorage from "@react-native-async-storage/async-storage";
import { MOCK_PROFILES, Profile } from "../data/mockProfiles";
import { api } from "./api";

// HOJE: Puxa do Mock no próprio Front
// DEPOIS: A pessoa do back troca isso por: await api.get('/feed')
export const fetchFeedProfiles = async (): Promise<Profile[]> => {
  return new Promise((resolve) => {
    // Simula 500ms de carregamento da rede
    setTimeout(() => {
      resolve(MOCK_PROFILES);
    }, 500);
  });
};

// HOJE: Apenas simula o envio do Like/Dislike
// DEPOIS: A pessoa do back troca por: await api.post('/interactions', { targetUserId, action })
export const registerInteraction = async (
  targetUserId: string,
  action: "LIKE" | "DISLIKE",
) => {
  console.log(
    `[FRONT] Ação ${action} registrada para o perfil ID: ${targetUserId}`,
  );
  return true;
};

export async function criarPerfil(dados: any) {
  const token = await AsyncStorage.getItem("access_token");
  console.log("TOKEN RECUPERADO:", token);

  const response = await api.post("perfis/", dados, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
