import { Profile } from "@/data/mockProfiles";
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

export async function fetchFeedProfiles(): Promise<Profile[]> {
  const response = await api.get("feed/");

  return response.data.map((perfil: any) => ({
    id: String(perfil.id),

    name: perfil.nome,
    age: perfil.idade,

    course: perfil.curso,
    campus: perfil.campus,

    status: perfil.bio || perfil.estado_civil,

    image:
      perfil.fotos?.length > 0
        ? perfil.fotos[0]
        : "https://via.placeholder.com/500",

    location: perfil.campus,

    bio: perfil.bio || "",
  }));
}

export async function registerInteraction(
  targetProfileId: string,
  action: "LIKE" | "DISLIKE",
) {
  const endpoint = action === "LIKE" ? "curtir/" : "rejeitar/";

  const response = await api.post(endpoint, {
    alvo_id: Number(targetProfileId),
  });

  return response.data;
}
