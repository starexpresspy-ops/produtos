# Checklist de Deploy — Star Express

## Antes do deploy

- [ ] Confirmar que o projeto está em `C:\dev\star_frete`
- [ ] Confirmar que não está em pasta do OneDrive
- [ ] Conferir `.env.local`
- [ ] Conferir `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Conferir `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Conferir `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Conferir `NEXT_PUBLIC_SITE_URL`
- [ ] Conferir `NEXT_PUBLIC_WHATSAPP_NUMBER`
- [ ] Rodar `npm run lint`
- [ ] Rodar `npm run build`
- [ ] Corrigir todos os erros

## Supabase

- [ ] Rodar migrations na ordem:
  - [ ] `20260702_initial_schema.sql`
  - [ ] `20260703_profiles.sql`
  - [ ] `20260703_product_audit.sql`
  - [ ] `20260703_rls.sql`
  - [ ] `20260703_storage.sql`
- [ ] Criar usuário lojista em Authentication (ver `docs/ACESSO_ADMIN.md`)
- [ ] Criar registro em `profiles` com role `lojista` e `active = true`
- [ ] Criar bucket `product-images`
- [ ] Criar bucket `store-assets`
- [ ] Validar policies de Storage (ver `supabase/STORAGE_SETUP.md`)
- [ ] Validar RLS
- [ ] Criar ou validar registro em `store_settings`

## Testes manuais

- [ ] Acessar home
- [ ] Acessar catálogo
- [ ] Filtrar por categoria
- [ ] Filtrar por marca
- [ ] Abrir página de produto
- [ ] Testar botão WhatsApp
- [ ] Testar compartilhamento
- [ ] Acessar `/admin/login`
- [ ] Fazer login como lojista
- [ ] Cadastrar categoria
- [ ] Cadastrar marca
- [ ] Cadastrar produto
- [ ] Subir imagem de produto
- [ ] Definir imagem de capa
- [ ] Editar preço
- [ ] Desativar produto
- [ ] Conferir se produto desativado saiu da vitrine
- [ ] Editar configurações da loja
- [ ] Conferir WhatsApp da loja
- [ ] Acessar `/termos-de-uso`
- [ ] Acessar `/politica-de-privacidade`
- [ ] Acessar `/trocas-e-garantia`
- [ ] Conferir links no rodapé
- [ ] Testar no celular

## Vercel

- [ ] Usar conta do cliente ou conta técnica da loja
- [ ] Configurar variáveis de ambiente
- [ ] Configurar domínio do cliente
- [ ] Atualizar `NEXT_PUBLIC_SITE_URL` para domínio final
- [ ] Fazer deploy
- [ ] Testar site publicado
- [ ] Testar painel publicado
- [ ] Testar upload publicado
- [ ] Testar WhatsApp publicado

## Responsabilidade operacional

- [ ] Confirmar que o WhatsApp é da loja
- [ ] Confirmar que o e-mail é da loja
- [ ] Confirmar que o domínio é da loja
- [ ] Confirmar que produtos foram cadastrados pelo lojista
- [ ] Confirmar que preços foram definidos pelo lojista
- [ ] Confirmar que imagens foram fornecidas pelo lojista
- [ ] Confirmar que política de troca e garantia foi definida pela loja
- [ ] Confirmar que o desenvolvedor não aparece na vitrine pública

## Contas e custos

Recomendado: Vercel, Supabase, domínio, WhatsApp, e-mail e demais serviços devem ficar em nome da loja ou do responsável pela operação comercial.

Caso sejam usados planos gratuitos, qualquer cobrança futura de Vercel, Supabase, domínio, armazenamento, tráfego ou serviços de terceiros será responsabilidade da loja contratante.
