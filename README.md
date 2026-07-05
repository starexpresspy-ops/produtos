# Star Express

Vitrine digital de produtos integrada ao WhatsApp, com painel administrativo para o lojista cadastrar produtos, preços, fotos, marcas, categorias e configurações da loja.

Repositório: https://github.com/starexpresspy-ops/produtos

Nome interno npm: `vitrine-whatsapp`

**Pasta do projeto:** `C:\dev\star_frete` (não usar OneDrive)

## Modelo de acesso

| Quem | Precisa de cadastro? | O que faz |
|------|----------------------|-----------|
| **Cliente final** | **Não** | Navega produtos e preços, filtra catálogo e chama no WhatsApp |
| **Lojista** | **Sim** | Acessa `/admin/login` para cadastrar produtos, marcas, categorias e fotos |

Não existe área `/conta`, cadastro público nem login para visitantes. A vitrine é 100% aberta.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL, Auth, Storage)
- Server Actions
- Zod

## Como rodar localmente

```bash
cd C:\dev\star_frete
npm install
cp .env.local.example .env.local
# Preencha as variáveis no .env.local
npm run dev
```

Acesse:

- Vitrine: http://localhost:3000
- Admin: http://localhost:3000/admin/login

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run preview` | Build + start |
| `npm run lint` | ESLint |

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

**Nunca** commite `.env.local`. **Nunca** exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend.

## Modo demo vs dados reais

| Situação | Comportamento |
|----------|---------------|
| Sem Supabase configurado | Vitrine usa dados demo; admin mostra listas vazias e banner de aviso |
| Com Supabase configurado | Vitrine e admin usam dados reais do banco |

O modo demo existe para apresentações locais sem banco. Em produção, configure sempre o Supabase.

## Configuração do Supabase

Execute as migrations no SQL Editor, nesta ordem:

1. `supabase/migrations/20260702_initial_schema.sql`
2. `supabase/migrations/20260703_profiles.sql`
3. `supabase/migrations/20260703_product_audit.sql`
4. `supabase/migrations/20260703_rls.sql`
5. `supabase/migrations/20260703_storage.sql`

Consulte também `supabase/STORAGE_SETUP.md` para buckets de imagens.

### Criar lojista

Conta oficial da loja:

- **E-mail:** `starexpresspy@gmail.com`
- **Nome:** Star Express PY
- **Painel:** `/admin/login`

**Opção A — Script automático** (requer `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`):

```bash
node scripts/create-lojista.mjs "starexpresspy@gmail.com" "SUA_SENHA" "Star Express PY"
```

**Opção B — Supabase Dashboard**

1. **Authentication** → **Users** → **Add user** → **Create new user**
2. E-mail: `starexpresspy@gmail.com`
3. Senha: (a definida para o lojista)
4. Marque **Auto Confirm User**
5. No SQL Editor, após rodar `20260703_profiles.sql`:

```sql
insert into public.profiles (id, name, role, active)
select id, 'Star Express PY', 'lojista', true
from auth.users
where email = 'starexpresspy@gmail.com'
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  active = excluded.active;
```

### Configurações iniciais da loja

Cadastre em `/admin/configuracoes` ou insira em `store_settings` via SQL.

## Deploy na Vercel

1. Conecte o repositório Git à Vercel
2. Configure as variáveis de ambiente
3. Atualize `NEXT_PUBLIC_SITE_URL` para o domínio final
4. Faça deploy
5. Siga `CHECKLIST_DEPLOY.md`

Recomendado: Vercel, Supabase, domínio, WhatsApp, e-mail e demais serviços devem ficar em nome da loja ou do responsável pela operação comercial.

Caso sejam usados planos gratuitos, qualquer cobrança futura de Vercel, Supabase, domínio, armazenamento, tráfego ou serviços de terceiros será responsabilidade da loja contratante.

## Recomendações para o MVP (custo baixo)

- até 200 produtos
- até 8 imagens por produto
- imagens preferencialmente com até 1 MB (WebP, até 1200px)
- usar WhatsApp manual
- não ativar automações pagas
- não adicionar checkout
- não adicionar cadastro de cliente
- revisar produtos indisponíveis periodicamente

## Responsabilidade operacional

Este sistema é uma ferramenta técnica de vitrine digital.

A operação comercial, cadastro de produtos, preços, imagens, disponibilidade, procedência, venda, pagamento, entrega, troca, garantia, atendimento ao consumidor e obrigações legais são de responsabilidade exclusiva da loja operadora.

O sistema não processa pagamento online, não possui checkout e não intermedia transações financeiras.

## Documentação adicional

- `CHECKLIST_DEPLOY.md` — checklist completo de deploy
- `ENTREGA_CLIENTE.md` — documento de entrega ao cliente
- `PROJECT_HANDOFF.md` — contexto técnico completo do projeto
- `supabase/STORAGE_SETUP.md` — configuração de buckets

## Rotas principais

| Área | URLs |
|------|------|
| Vitrine | `/`, `/produtos`, `/produto/[slug]`, `/categoria/[slug]` |
| Institucional | `/sobre`, `/contato`, `/termos-de-uso`, `/politica-de-privacidade`, `/trocas-e-garantia` |
| Admin | `/admin/login`, `/admin`, `/admin/produtos`, `/admin/marcas`, `/admin/categorias`, `/admin/configuracoes` |
