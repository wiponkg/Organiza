# Organiza+ – Gerenciador de Tarefas com Painel de Produtividade

O **Organiza+** é uma aplicação full-stack moderna projetada para ajudar usuários a gerenciarem suas tarefas diárias com eficiência, oferecendo uma visão analítica de sua produtividade através de gráficos e estatísticas.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React (Vite)**: Biblioteca principal para construção da interface.
- **Tailwind CSS**: Estilização moderna e responsiva.
- **React Router**: Gerenciamento de rotas.
- **Recharts**: Visualização de dados e gráficos de produtividade.
- **Lucide React**: Conjunto de ícones consistentes.
- **Motion**: Animações fluidas.
- **Axios**: Requisições HTTP.

### Backend
- **Node.js & Express**: Servidor e API REST.
- **JWT (JSON Web Token)**: Autenticação segura.
- **Bcrypt.js**: Hash de senhas.
- **Better-SQLite3**: Banco de dados relacional (utilizado como alternativa portátil ao MySQL para este ambiente).

## 📋 Funcionalidades

- **Autenticação Completa**: Registro, Login e proteção de rotas com JWT.
- **Gerenciamento de Tarefas (CRUD)**: Criar, editar, excluir e marcar tarefas como concluídas.
- **Priorização**: Definição de prioridade (Baixa, Média, Alta) com identificação visual.
- **Filtros Avançados**: Busca por texto, filtro por status e por prioridade.
- **Dashboard de Produtividade**:
  - Gráfico de barras de tarefas concluídas por semana.
  - Gráfico de pizza de distribuição por prioridade.
  - Cards de estatísticas rápidas (Total, Concluídas, Pendentes, Taxa de Conclusão).
- **Exportação**: Download da lista de tarefas em formato CSV.
- **Interface Moderna**: Suporte a **Dark Mode** e design totalmente responsivo.

## 🛠️ Como Rodar Localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000` no seu navegador.

## 🗄️ Estrutura do Banco de Dados

### Tabela `users`
- `id`: INTEGER PRIMARY KEY
- `name`: TEXT
- `email`: TEXT (UNIQUE)
- `password`: TEXT (HASHED)
- `created_at`: DATETIME

### Tabela `tasks`
- `id`: INTEGER PRIMARY KEY
- `user_id`: INTEGER (FOREIGN KEY)
- `title`: TEXT
- `description`: TEXT
- `priority`: TEXT (baixa, média, alta)
- `status`: TEXT (pendente, concluída)
- `due_date`: DATE
- `created_at`: DATETIME

## 💡 O que aprendi desenvolvendo

Durante o desenvolvimento deste projeto, aprofundei meus conhecimentos em:
- **Integração Full-Stack**: Comunicação eficiente entre React e Express.
- **Segurança**: Implementação de fluxos de autenticação robustos com JWT e proteção de rotas no frontend e backend.
- **UX/UI**: Criação de uma interface "dark mode" nativa e uso de animações para melhorar a experiência do usuário.
- **Visualização de Dados**: Transformação de dados brutos do banco em insights visuais úteis para o usuário final.
- **Arquitetura de Software**: Organização de pastas seguindo padrões de mercado (Controllers, Services, Contexts).

---
