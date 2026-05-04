import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types";
import { SESSION_COOKIE } from "@/lib/constants";

function secret() {
  return process.env.APP_SECRET || "demo-development-secret";
}

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(user: SessionUser) {
  const payload = base64url(JSON.stringify({ user, exp: Date.now() + 1000 * 60 * 60 * 24 }));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string): SessionUser | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      user: SessionUser;
      exp: number;
    };
    if (!parsed.exp || parsed.exp < Date.now() || !parsed.user?.active) return null;
    return parsed.user;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  cookies().set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24
  });
}

export function clearSession() {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export function getSession() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}
