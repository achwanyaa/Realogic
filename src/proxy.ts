import { NextResponse, type NextRequest } from "next/server";
import { routePrefixForHost } from "@/lib/sites";
import { refreshSession } from "@/lib/supabase/session";

// Sends each request to the folder for its domain (see src/lib/sites.ts) and
// keeps the visitor's Supabase session fresh.
export async function proxy(request: NextRequest) {
  const prefix = routePrefixForHost(request.headers.get("host"), process.env.DEFAULT_SITE);
  const url = request.nextUrl.clone();
  url.pathname = `${prefix}${url.pathname === "/" ? "" : url.pathname}`;

  return refreshSession(request, NextResponse.rewrite(url));
}

export const config = {
  // Everything except Next.js internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
