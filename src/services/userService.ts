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
  return [
    {
      id: "1",
      name: "Lucas Silva",
      age: 21,
      course: "Ciência da Computação",
      campus: "Campus Alcindo Cacela",
      status: "Procurando companhia para estudar",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800",
      location: "",
      bio: ""
    },
    {
      id: "2",
      name: "Mariana Costa",
      age: 20,
      course: "Direito",
      campus: "Campus BR",
      status: "Café entre as aulas",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
      location: "",
      bio: ""
    },
  ];
}

export async function registerInteraction(
  targetUserId: string,
  action: "LIKE" | "DISLIKE"
) {
  console.log(`Interação registrada: ${action} -> ${targetUserId}`);
  return { matched: action === "LIKE" };
}