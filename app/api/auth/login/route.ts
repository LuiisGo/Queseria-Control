import { NextRequest, NextResponse } from "next/server";
import { callBackend } from "@/lib/appsScriptClient";
import { setSession } from "@/lib/session";
import type { SessionUser } from "@/types";

const attempts = new Map<string, { count: number; resetAt: number }>();
const LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ success: false, error: "Solicitud no permitida." }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as { username?: string; password?: string };
  const clientIp = getClientIp(request);
  const key = `${clientIp}:${String(body.username || "").toLowerCase()}`;
  if (isRateLimited(key)) {
    return NextResponse.json({ success: false, error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
  }

  const response = await callBackend<SessionUser>("AUTH_LOGIN", {
    ...body,
    clientIp,
    userAgent: request.headers.get("user-agent") || ""
  });
  if (!response.success) {
    recordFailedAttempt(key);
    return NextResponse.json(response, { status: 401 });
  }
  attempts.delete(key);
  setSession(response.data);
  return NextResponse.json(response);
}

function getClientIp(request: NextRequest) {
  return (request.headers.get("x-forwarded-for") || request.headers.get("x-nf-client-connection-ip") || "unknown").split(",")[0].trim();
}

function isRateLimited(key: string) {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= Date.now()) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(key: string) {
  const current = attempts.get(key);
  if (!current || current.resetAt <= Date.now()) {
    attempts.set(key, { count: 1, resetAt: Date.now() + LIMIT_WINDOW_MS });
    return;
  }
  attempts.set(key, { ...current, count: current.count + 1 });
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
