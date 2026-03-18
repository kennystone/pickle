import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const runtime = "nodejs";

const COOKIE_NAME = "pickle_admin";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /create (not /create/login)
  if (pathname === "/create") {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/create/login", request.url));
    }
    try {
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL("/create/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create"],
};
