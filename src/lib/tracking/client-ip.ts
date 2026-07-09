export function getClientIpFromHeaders(headerStore: Headers): string {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headerStore.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const vercelIp = headerStore.get("x-vercel-forwarded-for")?.trim();
  if (vercelIp) {
    const first = vercelIp.split(",")[0]?.trim();
    if (first) return first;
  }

  return "desconhecido";
}

export function normalizeVisitPath(path?: string | null) {
  if (!path?.trim()) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}
