/**
 * Cria usuario lojista no Supabase (uso local, uma vez).
 *
 * Uso:
 *   node scripts/create-lojista.mjs <email> <senha> [nome]
 *
 * Exemplo:
 *   node scripts/create-lojista.mjs starexpresspy@gmail.com "D1a2v3i4$" "Star Express PY"
 *
 * Requer .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;

  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] ?? "Star Express PY";

if (!email || !password) {
  console.error(
    "Uso: node scripts/create-lojista.mjs <email> <senha> [nome]",
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  const missing = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  console.error("Variaveis ausentes em .env.local:", missing.join(", "));
  console.error("");
  console.error("1. Abra https://supabase.com/dashboard");
  console.error("2. Projeto star-express → Settings → API → Legacy keys");
  console.error("3. Cole anon em NEXT_PUBLIC_SUPABASE_ANON_KEY");
  console.error("4. Cole service_role em SUPABASE_SERVICE_ROLE_KEY");
  console.error("5. Rode este script novamente");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existingUsers } = await supabase.auth.admin.listUsers();
const found = existingUsers?.users?.find(
  (user) => user.email?.toLowerCase() === email.toLowerCase(),
);

let userId = found?.id;

if (found) {
  console.log("Usuario ja existe. Atualizando senha e profile...");
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    found.id,
    { password, email_confirm: true },
  );
  if (updateError) {
    console.error("Erro ao atualizar usuario:", updateError.message);
    process.exit(1);
  }
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "lojista", name },
  });

  if (error) {
    console.error("Erro ao criar usuario:", error.message);
    process.exit(1);
  }

  userId = data.user.id;
  console.log("Usuario criado:", userId);
}

const { error: profileError } = await supabase.from("profiles").upsert(
  {
    id: userId,
    name,
    role: "lojista",
    active: true,
  },
  { onConflict: "id" },
);

if (profileError) {
  console.error("Erro ao criar profile:", profileError.message);
  console.error(
    "Execute as migrations (20260703_profiles.sql) no Supabase e tente novamente.",
  );
  process.exit(1);
}

console.log("");
console.log("Lojista configurado com sucesso!");
console.log("E-mail:", email);
console.log("Nome:", name);
console.log("Painel: http://localhost:3000/admin/login");
