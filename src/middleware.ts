import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const PUBLIC_ADMIN = "/admin/login";

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname === PUBLIC_ADMIN) {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, active")
        .eq("id", user.id)
        .single();
      if (profile?.active && profile.role === "lojista") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL(PUBLIC_ADMIN, request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", user.id)
    .single();

  if (!profile?.active || profile.role !== "lojista") {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL(PUBLIC_ADMIN, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
