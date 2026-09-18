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

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma + SQLite.
Autenticação própria via cookie httpOnly assinado com JWT (bcrypt para senhas).

## Como rodar

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Acesse http://localhost:3000

- Painel de demonstração: **admin@barbearia.com** / **123456**
- Página pública de exemplo: http://localhost:3000/b/barbearia-modelo

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

## Produção

Antes de publicar, troque o `JWT_SECRET` no `.env` por um valor aleatório e
seguro, e troque o `DATABASE_URL` para um banco de produção (Postgres, por
exemplo) caso o SQLite não seja suficiente.

```bash
npm run build
npm start
```
