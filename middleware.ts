import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

function base64UrlToBytes(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function verify(token?: string) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.APP_SECRET || "demo-development-secret"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = btoa(String.fromCharCode(...new Uint8Array(signed)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  if (expected !== signature) return null;
  const parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as {
    user?: { role?: string; active?: boolean };
    exp?: number;
  };
  if (!parsed.user?.active || !parsed.exp || parsed.exp < Date.now()) return null;
  return parsed.user;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const user = await verify(request.cookies.get(SESSION_COOKIE)?.value);

  if (path === "/login" && user) {
    return NextResponse.redirect(new URL(user.role === "Admin" ? "/admin/dashboard" : "/tienda/inicio", request.url));
  }

  if (path.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    if (user.role !== "Admin") return NextResponse.redirect(new URL("/tienda/inicio", request.url));
  }

  if (path.startsWith("/tienda")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/tienda/:path*"]
};
