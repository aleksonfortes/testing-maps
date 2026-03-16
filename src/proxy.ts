import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-server";

export async function proxy(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request);

  // If Supabase isn't configured, allow all access (dev/demo mode)
  if (!supabase) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Unauthenticated users trying to access /workspace → redirect to /auth
  if (!user && pathname.startsWith("/workspace")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // Authenticated users on /auth → redirect to /workspace
  if (user && pathname === "/auth") {
    const url = request.nextUrl.clone();
    url.pathname = "/workspace";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/workspace/:path*", "/auth"],
};
