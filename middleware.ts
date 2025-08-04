import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for login page and auth endpoints
  if (pathname === "/login" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // For API routes (except auth), check Authorization header OR cookie
  if (pathname.startsWith("/api/")) {
    let token: string | undefined;

    // Check Authorization header first (for CLI)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // If no header, check cookie (for web)
    if (!token) {
      token = request.cookies.get("auth-token")?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No valid token provided" },
        { status: 401 }
      );
    }

    if (!(await verifyToken(token))) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // For web pages, check cookie
  const token = request.cookies.get("auth-token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
