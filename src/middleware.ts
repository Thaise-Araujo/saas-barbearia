import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "barbearia_session";

// Only checks that a session cookie is present (jsonwebtoken needs Node's
// crypto module, which isn't available in the Edge middleware runtime).
// The signature itself is verified with getSession() in Node contexts
// (layouts and route handlers), which redirect/reject on an invalid token.
export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
