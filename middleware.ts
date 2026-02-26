import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard"];

export function middleware(request: NextRequest) {
  if (PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route))) {
    // TODO: wire with Supabase middleware auth helpers.
    // Keeping route-level protection placeholder for now.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
