import { NextRequest, NextResponse } from "next/server";
import { callBackend } from "@/lib/appsScriptClient";
import { setSession } from "@/lib/session";
import type { SessionUser } from "@/types";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { username?: string; password?: string };
  const response = await callBackend<SessionUser>("AUTH_LOGIN", body);
  if (!response.success) {
    return NextResponse.json(response, { status: 401 });
  }
  setSession(response.data);
  return NextResponse.json(response);
}
