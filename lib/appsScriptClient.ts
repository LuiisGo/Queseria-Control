import "server-only";

import type { ApiResponse } from "@/types";
import { IS_DEMO_MODE } from "@/lib/constants";
import { runDemoAction } from "@/data/demoBackend";

export async function callBackend<T>(action: string, payload: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  if (IS_DEMO_MODE) {
    return (await runDemoAction(action, payload)) as ApiResponse<T>;
  }

  const url = process.env.APPS_SCRIPT_WEB_APP_URL;
  const secret = process.env.APP_SECRET;
  if (!url || !secret) {
    return { success: false, error: "Falta configurar APPS_SCRIPT_WEB_APP_URL o APP_SECRET." };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, action, payload }),
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(timeout);

    const json = (await response.json()) as ApiResponse<T>;
    if (!response.ok) {
      return { success: false, error: json.success === false ? json.error : "Error en Apps Script." };
    }
    return json;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo conectar con Apps Script.";
    return { success: false, error: message };
  }
}
