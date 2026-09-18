# BarberSaaS — Sistema de Agendamento para Barbearias

SaaS completo para barbearias: cada barbearia (tenant) tem seu próprio painel
administrativo e uma página pública de agendamento online.

## Funcionalidades

- **Landing page** de apresentação do produto
- **Cadastro / Login** — cada conta cria sua própria barbearia (multi-tenant)
- **Painel administrativo**:
  - Visão geral (agendamentos do dia, faturamento do mês, clientes, barbeiros)
  - Agenda com criação, conclusão, cancelamento e exclusão de agendamentos
  - Cadastro de serviços (nome, preço, duração)
  - Cadastro de barbeiros (ativar/desativar)
  - Base de clientes com histórico
  - Configurações da barbearia (nome, telefone, endereço, horário de funcionamento)
- **Página pública de agendamento** (`/b/[slug]`) — o cliente final escolhe
  serviço, barbeiro, dia e horário disponível e agenda sem precisar de login,
  com verificação automática de conflito de horário.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL (Neon).
Autenticação própria via cookie httpOnly assinado com JWT (bcrypt para senhas).

## Produção

Em produção na Vercel: **https://saas-barbearia-gamma.vercel.app**

- Painel de demonstração: **admin@barbearia.com** / **123456**
- Página pública de exemplo: https://saas-barbearia-gamma.vercel.app/b/barbearia-modelo

Banco de dados Postgres provisionado via integração Neon do marketplace da
Vercel (projeto `thaise/saas-barbearia`). `DATABASE_URL` e `JWT_SECRET` ficam
como variáveis de ambiente no projeto Vercel (Production/Preview/Development),
nunca commitados.

## Como rodar localmente

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Crie um `.env` local (não versionado) com:

```
DATABASE_URL="postgresql://..."   # string de conexão do seu Postgres (Neon, local, etc.)
JWT_SECRET="um-valor-aleatorio-longo"
```

Acesse http://localhost:3000

## Estrutura

```
prisma/schema.prisma      Modelo de dados (Barbershop, User, Barber, Service, Client, Appointment)
src/app/                  Rotas (App Router) — páginas e APIs
src/app/api/              Endpoints REST (autenticação, CRUD, agendamento público)
src/app/dashboard/        Painel administrativo (protegido por login)
src/app/b/[slug]/         Página pública de agendamento de cada barbearia
src/components/           Componentes compartilhados (shell do painel, formulário de agendamento)
src/lib/                  Prisma client, sessão/JWT, utilitários
```

## Deploy

```bash
npx vercel --prod
```

O projeto já está linkado ao Vercel (pasta `.vercel/`, não versionada) e o
repositório GitHub está conectado: todo push na branch `master` dispara um
deploy de produção automático.
