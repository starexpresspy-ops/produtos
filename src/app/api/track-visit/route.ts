import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { recordStorefrontVisitFromHeaders } from "@/lib/tracking/record-visit";
import { normalizeVisitPath } from "@/lib/tracking/client-ip";

export async function POST(request: Request) {
  let path: string | undefined;

  try {
    const body = (await request.json()) as { path?: string };
    path = body.path;
  } catch {
    path = undefined;
  }

  const headerStore = await headers();
  await recordStorefrontVisitFromHeaders(headerStore, normalizeVisitPath(path));

  return NextResponse.json({ ok: true });
}
