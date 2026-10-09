# 💘 cupidU - Front-end Mobile

O **cupidU** é um aplicativo mobile desenvolvido para aproximar estudantes da Universidade da Amazônia (UNAMA), facilitando conexões e laços sociais com base em interesses em comum e no ambiente acadêmico[cite: 1, 2].

Este repositório contém o código-fonte da aplicação mobile (Front-end)[cite: 6].

---

## 🛠️ Tecnologias Utilizadas

- **Framework Mobile:** React Native / Expo[cite: 6]
- **Autenticação & Validação:** Supabase Auth (Integração com e-mail institucional UNAMA)[cite: 5, 6]
- **Comunicação em Tempo Real / Chat:** Stream Chat SDK[cite: 5, 6]
- **Consumo de API:** Integrado via REST API com Back-end em Django REST Framework[cite: 5, 6]

---

## 📱 Fluxo da Interface e Telas

O aplicativo cobre a seguinte jornada do usuário:

1. **Boas-vindas / Splash Screen**[cite: 3]
2. **Login / Cadastro:** Validação com e-mail institucional e código de 5 dígitos[cite: 2, 3]
3. **Perfil Acadêmico:** Configuração das informações do estudante[cite: 3]
4. **Feed:** Visualização de perfis compatíveis do mesmo campus[cite: 2, 3]
5. **Flechar / Rejeitar:** Interação com os perfis do feed[cite: 3]
6. **Match:** Tela de notificação de combinação entre estudantes[cite: 3]
7. **Chat:** Mensagens diretas em tempo real para estudantes com _match_[cite: 3, 5]

---

## 🎨 Identidade Visual

- **Paleta de Cores:**
  - Berry (`#8B1A4A`)[cite: 7]
  - Passion Red (`#ED1C24` / `#E91E23`)[cite: 7]
  - Rose (`#E91E63`)[cite: 7]
  - Deep Bordeaux (`#4A0E1E`)[cite: 7]
  - Off-White (`#FAF3EB`)[cite: 7]
- **Tipografia:** Montserrat SemiBold e Circular Std[cite: 7]

---

## 🚀 Como Executar o Projeto Localmente

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor de desenvolvimento do Expo
npx expo start
```
