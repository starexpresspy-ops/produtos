# Configuracao de Storage — Star Express

O projeto usa dois buckets no Supabase Storage:

| Bucket | Uso |
|--------|-----|
| `product-images` | Fotos de produtos |
| `store-assets` | Logos de marcas, imagens de categorias |

## Configuracao automatica (recomendado)

No **SQL Editor** do Supabase, execute as migrations nesta ordem:

1. `supabase/migrations/20260702_initial_schema.sql`
2. `supabase/migrations/20260703_profiles.sql`
3. `supabase/migrations/20260703_product_audit.sql`
4. `supabase/migrations/20260703_rls.sql`
5. `supabase/migrations/20260703_storage.sql`

A migration `20260703_storage.sql` cria os buckets e as policies de leitura publica e escrita restrita ao lojista.

## Configuracao manual (alternativa)

No Supabase Dashboard → **Storage** → **New bucket**:

### Bucket `product-images`

- Public bucket: **sim**
- File size limit: **1 MB**
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

### Bucket `store-assets`

- Public bucket: **sim**
- File size limit: **1 MB**
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

Depois execute `20260703_rls.sql` e `20260703_storage.sql` para aplicar as policies.

## Regras de seguranca

- Visitantes anonimos: **somente leitura**
- Lojista autenticado com `profiles.role = 'lojista'` e `active = true`: upload, edicao e remocao
- Upload anonimo: **bloqueado**

## Recomendacao de imagens

- Formato preferencial: **WebP**
- Largura maxima recomendada: **1200px**
- Tamanho maximo: **1 MB** por arquivo
- Ate **8 imagens** por produto
