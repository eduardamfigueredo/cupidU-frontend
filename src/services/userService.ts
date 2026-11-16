import { supabase } from "../lib/supabase";
import { api } from "./api";

export async function criarPerfil(dados: any) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("SEM_SESSAO");
  }

  const response = await api.post("perfis/", dados, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return response.data;
}
