# Acesso ao painel administrativo

Documento interno do projeto Star Express. Consulte este arquivo quando precisar das credenciais de login.

## Produção

| Campo | Valor |
|--------|--------|
| **URL** | https://produtos-gold.vercel.app/admin/login |
| **E-mail** | `starexpresspy@gmail.com` |
| **Senha** | `D1a2v3i4$` |
| **Nome** | Star Express PY |
| **Perfil** | lojista |

## Local (desenvolvimento)

| Campo | Valor |
|--------|--------|
| **URL** | http://localhost:3000/admin/login |
| **E-mail** | `starexpresspy@gmail.com` |
| **Senha** | `D1a2v3i4$` |

## Recriar ou resetar o usuário

Requer `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`:

```bash
node scripts/create-lojista.mjs "starexpresspy@gmail.com" "D1a2v3i4$" "Star Express PY"
```

O script cria o usuário no Supabase Auth, confirma o e-mail e garante o perfil `lojista` ativo em `profiles`.

## Observações

- A senha do **banco Postgres** do Supabase (Database password) é diferente da senha do painel admin.
- Se o login falhar, verifique em **Supabase → Authentication → Users** se o e-mail está confirmado e se existe registro em `profiles` com `role = 'lojista'` e `active = true`.
