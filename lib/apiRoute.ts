import { NextRequest, NextResponse } from "next/server";
import { callBackend } from "@/lib/appsScriptClient";
import { cachedBackend, clearBackendCache } from "@/lib/backendCache";
import { getSession } from "@/lib/session";

type ActionMap = {
  list?: string;
  create?: string;
  update?: string;
  detail?: string;
};

export function ok<T>(data: T, message = "") {
  return NextResponse.json({ success: true, data, message });
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function handleList(action: string, request: NextRequest) {
  const session = getSession();
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const response = await cachedBackend(action, { ...query, currentUser: session });
  return NextResponse.json(response, { status: response.success ? 200 : 400 });
}

export async function handleWrite(action: string, request: NextRequest) {
  const session = getSession();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const response = await callBackend(action, { ...body, currentUser: session });
  if (response.success) clearBackendCache();
  return NextResponse.json(response, { status: response.success ? 200 : 400 });
}

export function crudHandlers(actions: ActionMap) {
  return {
    GET: async (request: NextRequest) => handleList(actions.list || actions.detail || "", request),
    POST: async (request: NextRequest) => {
      const body = (await request.clone().json().catch(() => ({}))) as Record<string, unknown>;
      const action = body.id && actions.update ? actions.update : actions.create;
      if (!action) return fail("Acción no configurada.");
      return handleWrite(action, request);
    }
  };
}
