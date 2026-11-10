export interface Profile {
  location: string;
  id: string;
  name: string;
  age: number;
  course: string;
  campus: string;
  status: string;
  bio: string;
  image: string;
}

export const MOCK_PROFILES: Profile[] = [
  {
      id: "1",
      name: "Ana Clara",
      age: 21,
      course: "Enfermagem",
      campus: "Campus Alcindo Cacela",
      status: "Solteira",
      bio: "Amante de café, livros de suspense e conversas sobre a vida acadêmica.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
      location: ""
  },
  {
    id: "2",
    name: "Lucas Mendes",
    age: 23,
    course: "Engenharia de Software",
    campus: "Campus Alcindo Cacela",
    status: "Solteiro",
    bio: "Desenvolvedor nas horas vagas e entusiasta de corrida ao ar livre.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    location: ""
  },
  {
    id: "3",
    name: "Beatriz Lima",
    age: 20,
    course: "Arquitetura e Urbanismo",
    campus: "Campus Ananindeua",
    status: "Solteira",
    bio: "Apaixonada por design, fotografia e explorar novos pontos turísticos.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
    location: ""
  },
  {
    id: "4",
    name: "Gabriel Santos",
    age: 22,
    course: "Direito",
    campus: "Campus Alcindo Cacela",
    status: "Solteiro",
    bio: "Música acústica, debates sobre cinema e bons momentos entre amigos.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    location: ""
  },
];
