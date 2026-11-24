import { supabase } from "@/lib/supabase";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL; // ex.: https://backend.com/api

// Instância usada pelo login.tsx e pelo resto do app
export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Anexa o token do Supabase em toda requisição, se houver sessão
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Padroniza a mensagem de erro vinda do backend ({ detail: "..." })
function mensagemDeErro(erro: unknown): Error {
  if (axios.isAxiosError(erro)) {
    return new Error(erro.response?.data?.detail ?? "Erro na requisição");
  }
  return erro instanceof Error ? erro : new Error("Erro na requisição");
}

export type RespostaCurtir = {
  curtido: boolean;
  match: boolean;
  canal_id?: string;
  perfil?: { id: string; user_id: string; nome: string; foto_url?: string };
};

export async function curtirPerfil(alvoId: string): Promise<RespostaCurtir> {
  try {
    const { data } = await api.post<RespostaCurtir>("/curtir/", {
      alvo_id: alvoId,
    });
    return data;
  } catch (erro) {
    throw mensagemDeErro(erro);
  }
}

export async function rejeitarPerfil(
  alvoId: string,
): Promise<{ rejeitado: boolean }> {
  try {
    const { data } = await api.post<{ rejeitado: boolean }>("/rejeitar/", {
      alvo_id: alvoId,
    });
    return data;
  } catch (erro) {
    throw mensagemDeErro(erro);
  }
}
