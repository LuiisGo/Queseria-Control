import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ success: false, error: "Solicitud no permitida." }, { status: 403 });
  }
  clearSession();
  return NextResponse.json({ success: true, data: null, message: "Sesión cerrada." });
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (origin && origin !== request.nextUrl.origin) return false;
  if (!origin && referer) {
    try {
      return new URL(referer).origin === request.nextUrl.origin;
    } catch {
      return false;
    }
  }
  return true;
}
