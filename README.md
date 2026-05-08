# Tick

Aplicativo web de agenda e produtividade pessoal com foco em organização de rotina, metas e conquistas.

## Funcionalidades

- Agenda mensal e semanal
- Cadastro de demandas com categoria, prioridade e horário
- Metas com progresso automático baseado nas demandas concluídas
- Wishlist (desejos) com acompanhamento
- Conquistas por marcos de uso
- Perfil do usuário com resumo de desempenho
- Configurações por usuário (módulos e preferências)
- Sistema de notificações internas
- Tema claro e escuro (alternância no app)
- Layout responsivo
- Navegação mobile/desktop

## Stack

- Frontend: React + TypeScript + Vite
- Estilização: Tailwind CSS
- Backend: Node.js + Express
- ORM: Prisma
- Banco de dados: PostgreSQL (Neon)

## Estrutura do projeto

- `src/`: frontend React
- `server.js`: API Express
- `prisma/schema.prisma`: schema do banco

## Requisitos

- Node.js 20+
- npm 10+
- Banco PostgreSQL acessível (ex.: Neon)

## Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require
```

Observações:
- `DATABASE_URL` é obrigatória para o backend/Prisma.
- Em produção, o `PORT` é injetado pela plataforma (Render).

## Rodar localmente

1. Instalar dependências:

```bash
npm install
```

2. Gerar client Prisma:

```bash
npm run prisma:generate
```

3. Subir frontend:

```bash
npm run dev
```

4. Em outro terminal, subir API:

```bash
npm run dev:api
```

Frontend: `http://localhost:5173`  
API: `http://localhost:4000`

## Scripts disponíveis

- `npm run dev`: inicia frontend (Vite)
- `npm run dev:api`: inicia backend Express
- `npm run build`: build de produção do frontend
- `npm run lint`: valida lint
- `npm run preview`: serve build local
- `npm run prisma:generate`: gera Prisma Client
- `npm run prisma:push`: sincroniza schema no banco

## Deploy (produção)

### Backend (Render)

- Build command:

```bash
npm install && npx prisma generate
```

- Start command:

```bash
node server.js
```

- Variáveis:
  - `DATABASE_URL`
  - `NODE_ENV=production`

### Frontend (Vercel)

- Framework preset: Vite
- Build command: `npm run build`
- Output: `dist`
- Variável:
  - `VITE_API_URL=https://SEU_BACKEND.onrender.com`

## Endpoints principais da API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/day-demands`
- `PUT /api/day-demands`
- `GET /api/goals`
- `POST /api/goals`
- `PATCH /api/goals/:goalId`
- `DELETE /api/goals/:goalId`
- `GET /api/wishlist`
- `POST /api/wishlist`
- `PATCH /api/wishlist/:wishItemId`
- `DELETE /api/wishlist/:wishItemId`
- `GET /api/achievements`
- `POST /api/achievements/unlock`

## Licença

Projeto para uso pessoal.

## Capturas de tela

As imagens abaixo estão em caminho local. Se não renderizarem no preview, clique nos links:

- [Login](file:///C:/Users/nicol/.cursor/projects/c-Users-nicol-OneDrive-rea-de-Trabalho-Tick/assets/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_1f726825231c9c27214d80a96f683d4f_images_image-4bc32a40-1135-4fb1-a921-9ea55bb6b3d0.png)
- [Cadastro](file:///C:/Users/nicol/.cursor/projects/c-Users-nicol-OneDrive-rea-de-Trabalho-Tick/assets/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_1f726825231c9c27214d80a96f683d4f_images_image-b7f3e985-3f93-4fb3-b884-a0468bdae772.png)
- [Início](file:///C:/Users/nicol/.cursor/projects/c-Users-nicol-OneDrive-rea-de-Trabalho-Tick/assets/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_1f726825231c9c27214d80a96f683d4f_images_image-9b813f57-1765-491c-a329-7cf19a361d62.png)
- [Semana](file:///C:/Users/nicol/.cursor/projects/c-Users-nicol-OneDrive-rea-de-Trabalho-Tick/assets/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_1f726825231c9c27214d80a96f683d4f_images_image-8ab681ad-d636-4b20-b2dd-7da353df4dec.png)
- [Mensal](file:///C:/Users/nicol/.cursor/projects/c-Users-nicol-OneDrive-rea-de-Trabalho-Tick/assets/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_1f726825231c9c27214d80a96f683d4f_images_image-34861975-60c0-4969-9c92-ac8eb28a3709.png)
- [Metas](file:///C:/Users/nicol/.cursor/projects/c-Users-nicol-OneDrive-rea-de-Trabalho-Tick/assets/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_1f726825231c9c27214d80a96f683d4f_images_image-5955596b-de66-4302-a505-1fbc963fb1af.png)
- [Perfil](file:///C:/Users/nicol/.cursor/projects/c-Users-nicol-OneDrive-rea-de-Trabalho-Tick/assets/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_1f726825231c9c27214d80a96f683d4f_images_image-c34232a5-92db-4646-af24-dbc25695b780.png)
