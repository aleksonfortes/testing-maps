import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-server";

/**
 * Proxy middleware for Next.js 16/Turbopack.
 * Handles Supabase session refreshing and route protection.
 */
export async function proxy(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request);

  // If Supabase isn't configured, allow all access (dev/demo mode)
  if (!supabase) {
    return response;
  }

  // Refresh session if it's expired
  await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png (brand logo)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};
