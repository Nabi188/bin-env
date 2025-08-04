import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/jwt";
import { envConfig } from "@/lib/envConfig";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || password !== envConfig.PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await createToken();
    const userAgent = request.headers.get("user-agent") || "";
    const isCLI =
      userAgent.includes("curl") ||
      userAgent.includes("cli") ||
      request.headers.get("x-client-type") === "cli";

    if (isCLI) {
      // For CLI: return token without setting cookie
      return NextResponse.json({ token });
    } else {
      // For web: set cookie and return success
      const response = NextResponse.json({ success: true });
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
