# CupidU - Front-end Mobile

O **CupidU** é um aplicativo mobile desenvolvido para aproximar estudantes da Universidade da Amazônia (UNAMA), facilitando conexões e laços sociais com base em interesses em comum e no ambiente acadêmico.

Este repositório contém o código-fonte da aplicação mobile (Front-end).


## Tecnologias Utilizadas

- **Framework Mobile:** React Native com Expo (Expo Router)
- **Linguagem:** TypeScript
- **Estilização:** StyleSheet nativo (Design Minimalista / Dark Mode)
- **Ícones:** `@expo/vector-icons` (Feather)
- **Autenticação & Validação:** Supabase Auth (Integração com e-mail institucional UNAMA)
- **Comunicação em Tempo Real / Chat:** Stream Chat SDK
- **Consumo de API:** Integrado via REST API com Back-end em Django REST Framework

## Identidade Visual

- **Paleta de Cores:**
  - Berry (`#8B1A4A`)
  - Passion Red (`#ED1C24` / `#E91E23`)
  - Rose (`#E91E63`)
  - Deep Bordeaux (`#4A0E1E`)
  - Off-White (`#FAF3EB`)
- **Tipografia:** Montserrat SemiBold e Circular Std


## Estrutura de Telas e Rotas (`src/app`)

- [x] **Splash / Entrada (`index.tsx`):** Redirecionamento e tela inicial.
- [x] **Feed (`feed.tsx`):** Visualização dos cards de perfis com botões de interações.
- [x] **Perfil (`perfil.tsx`):** Visualização dos dados do estudante, tags e opções da conta.
- [x] **Login (`login.tsx`):** Autenticação de utilizadores.
- [x] **Cadastro (`cadastro.tsx`):** Registo inicial de estudantes.
- [x] **Verificação (`verificacao.tsx`):** Validação com código de confirmação.
- [x] **Completar Perfil (`completar-perfil.tsx`):** Configuração de dados acadêmicos e preferências.

## Como Executar o Projeto Localmente

1. **Instalar as dependências:**
   ```bash
   npm install
   
2. **Iniciar o servidor de desenvolvimento do Expo (com limpeza de cache):**
   npx expo start -c
   
4. **Abra o aplicativo Expo Go no seu telemóvel físico e escaneie o QR Code exibido no terminal.**
   
### Como salvar no GitHub:

1. Cola o código acima no teu ficheiro `README.md` no VS Code e salva (`Ctrl + S`).
2. No terminal, executa:

```bash
git add README.md
git commit -m "docs: limpa marcadores e atualiza README"
git push origin main
