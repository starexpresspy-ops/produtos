# Star Express — Prompt de Contexto do Projeto

Use este documento como prompt inicial em novas conversas, para onboarding de desenvolvedores ou para retomar o trabalho após pausa.

---

## PROMPT (copie a partir daqui)

Você está trabalhando no projeto **Star Express** (nome interno npm: `vitrine-whatsapp`), uma vitrine online de produtos importados (eletrônicos, perfumes, acessórios) integrada ao **WhatsApp**. Não há pagamento online, checkout, carrinho ou cadastro de clientes no MVP — a venda é fechada pelo WhatsApp.

**Workspace obrigatório:** `C:\dev\star_frete`  
**Não usar OneDrive** — o projeto foi perdido parcialmente pela sincronização do OneDrive; a cópia canônica é a pasta local acima.

---

### 1. OBJETIVO DO SISTEMA

Criar uma vitrine digital responsiva com:

- **Vitrine pública** — catálogo, busca, filtros, página de produto, categorias, botão WhatsApp
- **Painel administrativo (lojista)** — cadastro de produtos, marcas, categorias, fotos, preços e disponibilidade
- **Integração Supabase** — banco PostgreSQL, autenticação, storage de imagens
- **Deploy futuro** — Vercel (site) + Supabase (dados)

**Público-alvo do cliente:** loja de produtos importados que vende via WhatsApp.

**Usuários do sistema:**

| Tipo | Cadastro | Acesso |
|------|----------|--------|
| Visitante (cliente final) | Não precisa | Vitrine pública — produtos, preços e WhatsApp |
| Lojista | Sim (criado manualmente no Supabase) | `/admin/*` — CRUD completo |

Não existe cadastro de cliente, área `/conta` nem login na vitrine pública.

---

### 2. STACK TÉCNICA

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16.2.9 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS v4 |
| Backend | Server Actions (sem API Routes REST) |
| Banco / Auth / Storage | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| Validação | Zod |
| Ícones | lucide-react |
| Deploy previsto | Vercel |

**Scripts npm:**

```bash
npm run dev       # desenvolvimento
npm run build     # build produção
npm run start     # servidor produção
npm run preview   # build + start (apresentações)
npm run lint      # eslint
```

---

### 3. ESTRUTURA DO PROJETO

```
C:\dev\star_frete\
├── src/
│   ├── app/
│   │   ├── (public)/          # Vitrine (/, /produtos, /produto/[slug], etc.)
│   │   └── admin/             # Painel (/admin/login + /admin/*)
│   ├── actions/               # Server Actions (auth, CRUD, CSV)
│   ├── components/
│   │   ├── admin/             # Forms, shell, CSV, imagens
│   │   ├── public/            # Header, catalog, cards
│   │   ├── shared/            # WhatsApp, preço, badges
│   │   └── ui/                # FormField, Container, etc.
│   ├── services/              # catalog.ts, admin/*, supabase/public-catalog.ts
│   ├── lib/                   # supabase clients, validations, demo data, utils
│   ├── types/                 # Domain types
│   └── middleware.ts          # Proteção /admin/*
├── supabase/migrations/       # Schema SQL
├── .env.local.example         # Template de variáveis
└── PROJECT_HANDOFF.md         # Este arquivo
```

---

### 4. ROTAS IMPLEMENTADAS

#### Vitrine pública

| Rota | Descrição |
|------|-----------|
| `/` | Home — hero, categorias, destaques, recentes |
| `/produtos` | Catálogo completo com filtros (busca, categoria, marca, disponibilidade) |
| `/produto/[slug]` | Detalhe do produto — galeria, preço, WhatsApp, compartilhar |
| `/categoria/[slug]` | Produtos filtrados por categoria |
| `/sobre` | Página institucional |
| `/contato` | Contato + botão WhatsApp |

#### Painel admin

| Rota | Descrição |
|------|-----------|
| `/admin/login` | Login do lojista |
| `/admin` | Dashboard (totais) |
| `/admin/produtos` | Lista + importação CSV |
| `/admin/produtos/novo` | Cadastrar produto |
| `/admin/produtos/[id]` | Editar produto + fotos |
| `/admin/categorias` | Lista + importação CSV |
| `/admin/categorias/novo` | Nova categoria |
| `/admin/categorias/[id]` | Editar categoria + imagem |
| `/admin/marcas` | Lista + importação CSV |
| `/admin/marcas/novo` | Nova marca |
| `/admin/marcas/[id]` | Editar marca + logo |
| `/admin/configuracoes` | Visualização de store_settings (somente leitura) |

**Não implementado:** `/marca/[slug]` na vitrine pública (marca só como filtro no catálogo).

---

### 5. FUNCIONALIDADES ENTREGUES

#### Vitrine pública ✅

- [x] Layout responsivo (Header, Footer, tema Star Express)
- [x] Home com categorias, produtos em destaque e recentes
- [x] Catálogo com filtros client-side (`CatalogView.tsx`)
- [x] Página de produto com galeria, preço normal/promocional, badge de estoque
- [x] Botão WhatsApp (`wa.me`) com mensagem personalizada por produto
- [x] Botão compartilhar
- [x] Produtos relacionados
- [x] Cache ISR 60s + tags `catalog` / `products`
- [x] Modo demo quando Supabase não configurado

#### Painel lojista ✅

- [x] Autenticação email/senha via Supabase Auth
- [x] Middleware protegendo `/admin/*` (role `lojista` + `active`)
- [x] Dashboard com contadores
- [x] CRUD de produtos (nome, slug, SKU, descrições, preço, promoção, categoria, marca, estoque, condição, ativo, destaque)
- [x] Upload de fotos de produto (até 8 imagens, definir capa, remover) — bucket `product-images`
- [x] CRUD de categorias (nome, slug, descrição, ordem, ativo, imagem) — bucket `store-assets`
- [x] CRUD de marcas (nome, slug, ativo, logo) — bucket `store-assets`
- [x] Importação CSV de produtos, categorias e marcas
- [x] Banner de aviso quando Supabase não configurado
- [x] Soft delete de produtos via `deleted_at` (action `archiveProduct` existe)

#### Integração Supabase ✅ (parcial)

- [x] Cliente SSR com cookies (`src/lib/supabase/server.ts`)
- [x] Cliente público sem cookies para ISR (`src/lib/supabase/public.ts`)
- [x] Facade `catalog.ts` alternando demo ↔ Supabase
- [x] Revalidação de cache após alterações admin (`revalidateStorefront`)
- [x] Mapeamento de imagens públicas do storage

#### Performance ✅

- [x] `unstable_cache` / `React.cache` no catálogo público
- [x] Uma query agregada na home (`getHomeProducts`)
- [x] Cliente Supabase público sem overhead de cookies na vitrine
- [x] `npm run preview` para apresentações em modo produção

---

### 6. BANCO DE DADOS (SUPABASE)

**Migration:** `supabase/migrations/20260702_initial_schema.sql`

**Tabelas criadas na migration:**

| Tabela | Campos principais |
|--------|-------------------|
| `categories` | name, slug, description, image_path, sort_order, active |
| `brands` | name, slug, logo_path, active |
| `products` | name, slug, sku, descriptions, price, promotional_price, category_id, brand_id, stock_*, condition, featured, active, sort_order, created_by, deleted_at |
| `product_images` | product_id, storage_path, alt_text, sort_order, is_cover |
| `store_settings` | store_name, whatsapp_number, whatsapp_message_template, instagram, email, endereço, entrega, garantia, troca, horário |

**Tabela referenciada no código mas AUSENTE na migration:**

- `profiles` — id, name, role (`lojista` | `cliente`), active, created_at, updated_at  
  Usada em: `middleware.ts`, `session.ts`, `actions/auth.ts`

**Storage buckets esperados (criar manualmente no Supabase):**

- `product-images` — fotos de produtos (público)
- `store-assets` — logos de marcas e imagens de categorias (público)

**RLS:** não definida na migration — configurar no Supabase conforme necessidade.

---

### 7. VARIÁVEIS DE AMBIENTE

Arquivo: `.env.local` (não commitar)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://bisbkfnwcfreckxfufyg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave anon do Supabase>
SUPABASE_SERVICE_ROLE_KEY=<chave service_role — só servidor>
NEXT_PUBLIC_WHATSAPP_NUMBER=5545999999999
```

`isSupabaseConfigured()` retorna `true` apenas com URL + anon key preenchidos.

**Credenciais de teste (lojista):**

- E-mail: `starexpresspy@gmail.com`
- Senha: `1q2w3e4r5t`
- Painel: http://localhost:3000/admin/login

---

### 8. MODO DEMO vs DADOS REAIS

| Contexto | Comportamento |
|----------|---------------|
| **Sem `.env.local` / sem chaves** | Vitrine usa `DEMO_PRODUCTS`, `DEMO_CATEGORIES`, `DEMO_BRANDS` de `src/lib/data/` |
| **Admin sem Supabase** | Listas vazias, login falha, banner "Supabase não configurado" |
| **Com Supabase configurado** | Vitrine e admin leem/escrevem no banco real |

**Importante:** versões antigas do admin mostravam marcas demo como cadastradas — isso foi corrigido; sem Supabase a lista fica vazia.

---

### 9. STATUS ATUAL (jul/2026)

#### ✅ Funcionando

- Build de produção passa (`npm run build`)
- Vitrine pública completa (demo ou Supabase)
- CRUD admin de produtos, marcas, categorias
- Upload de imagens (produto, categoria, marca)
- Importação CSV (produtos, marcas, categorias)
- Autenticação real com Supabase SSR + middleware
- Performance otimizada para apresentação ao cliente

#### ⚠️ Pendente / incompleto

| Item | Prioridade | Detalhe |
|------|------------|---------|
| `.env.local` com chaves reais | **Alta** | URL já definida; anon e service_role precisam ser coladas do Supabase Dashboard |
| Tabela `profiles` + trigger de signup | **Alta** | Auth quebra sem ela; criar SQL ou rodar migration original perdida |
| Buckets de storage no Supabase | **Alta** | `product-images` e `store-assets` com acesso público de leitura |
| RLS policies | Média | Não há policies na migration atual |
| Edição de `store_settings` no admin | Média | Página `/admin/configuracoes` é somente leitura |
| Importação de imagens via CSV | Baixa | `uploadProductImageFromUrl` é stub (não faz upload) |
| UI para arquivar produto | Baixa | Action `archiveProduct` existe, sem botão na interface |
| Dashboard "destaques" | Baixa | `highlights` hardcoded como 0 |
| `sort_order` de produtos no form | Baixa | Existe no banco, não no `ProductForm` |
| Rota pública `/marca/[slug]` | Baixa | Não implementada |
| `README.md` na raiz | Baixa | Não existe |
| Deploy Vercel + domínio cliente | Entrega | Processo documentado verbalmente, não automatizado |

#### 🐛 Problemas conhecidos resolvidos

- Marca cadastrada não aparecia no produto → causado por Supabase não configurado + dados demo no admin (corrigido)
- `"use server" file can only export async functions` → removido export de constante em actions
- `revalidateTag` com 1 arg → corrigido para 2 args no Next.js 16
- Perda de arquivos pelo OneDrive → projeto restaurado em `C:\dev\star_frete`

---

### 10. ARQUIVOS-CHAVE

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/services/catalog.ts` | API unificada vitrine (demo ↔ Supabase) |
| `src/services/supabase/public-catalog.ts` | Queries públicas com cache |
| `src/middleware.ts` | Proteção rotas admin |
| `src/lib/auth/session.ts` | `getCurrentUser()` |
| `src/actions/auth.ts` | Login/logout lojista |
| `src/actions/admin/products.ts` | Salvar produto, imagens |
| `src/actions/admin/brands.ts` | CRUD marcas + CSV |
| `src/actions/admin/categories.ts` | CRUD categorias + CSV |
| `src/actions/admin/products-import.ts` | Importação CSV produtos |
| `src/components/admin/ProductForm.tsx` | Formulário de produto |
| `src/components/admin/ProductImageManager.tsx` | Gestão de fotos |
| `src/components/public/CatalogView.tsx` | Filtros do catálogo |
| `src/lib/catalog/revalidate.ts` | Invalidação de cache |
| `src/lib/supabase/env.ts` | Checagem de configuração |

---

### 11. REGRAS DE NEGÓCIO

- Produto só aparece na vitrine se `active = true` e `deleted_at IS NULL`
- `hide_when_out_of_stock` oculta produto quando indisponível (coluna existe, sem UI admin)
- `stock_status`: `available` | `unavailable` | `on_request`
- `condition`: `new` | `used` | `open_box`
- Slugs gerados automaticamente via `slugify()` se não informados
- Marca inativa não aparece no select de produto (exceto se já vinculada na edição)
- Máximo 8 fotos por produto, 5 MB cada (JPEG/PNG/WebP)
- WhatsApp usa template configurável + nome/slug do produto na mensagem

---

### 12. PRÓXIMOS PASSOS SUGERIDOS

1. Preencher `.env.local` com chaves do Supabase (Legacy keys)
2. Executar SQL: migration atual + criar tabela `profiles` + seed `store_settings`
3. Criar buckets `product-images` e `store-assets` no Storage
4. Criar usuário lojista em Authentication → Users com metadata `role: lojista`
5. Testar fluxo: marca → categoria → produto → fotos → vitrine
6. Implementar edição de `store_settings` no admin
7. Deploy na Vercel com domínio do cliente
8. Entregar credenciais e mini-treinamento ao cliente

---

### 13. ENTREGA AO CLIENTE (RESUMO)

| Item | Valor |
|------|-------|
| Site vitrine | `https://www.dominiodocliente.com.br` |
| Painel admin | `https://www.dominiodocliente.com.br/admin/login` |
| Hospedagem site | Vercel |
| Banco de dados | Supabase (conta do cliente recomendada) |
| O que o cliente faz | Cadastra produtos, preços, fotos, marcas, categorias |
| O que o dev mantém | Deploy, Supabase, domínio, correções |

---

### 14. CONTEXTO HISTÓRICO

- Projeto iniciado como vitrine WhatsApp para loja de importados (Star Express)
- Desenvolvido localmente; deploy previsto na Vercel
- Projeto Supabase: `star-express` — URL `https://bisbkfnwcfreckxfufyg.supabase.co`
- Código original estava em OneDrive e foi parcialmente perdido; cópia de trabalho em `C:\dev\star_frete`
- ~90 arquivos em `src/` restaurados; alguns stubs permanecem
- Next.js 16 tem breaking changes — consultar `node_modules/next/dist/docs/` antes de alterar APIs

---

## FIM DO PROMPT

Ao retomar o desenvolvimento, confirme sempre:
1. Está em `C:\dev\star_frete` (não OneDrive)
2. `.env.local` está configurado
3. `npm run build` passa antes de entregar
4. Fluxo marca → produto foi testado manualmente
