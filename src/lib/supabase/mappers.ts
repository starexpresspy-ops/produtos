import type { Profile, UserRole } from "@/types/auth";

interface ProfileRow {
  id: string;
  name: string;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function mapProfile(row: ProfileRow): Profile {
  const role: UserRole = row.role === "lojista" ? "lojista" : "cliente";

  return {
    id: row.id,
    name: row.name,
    role,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getPublicImageUrl(
  bucket: string,
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return undefined;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
