import "server-only";

import { callBackend } from "@/lib/appsScriptClient";
import type { ApiResponse } from "@/types";

type CacheEntry = {
  expiresAt: number;
  response: ApiResponse<unknown>;
};

const cache = new Map<string, CacheEntry>();
const LIST_TTL_MS = 8000;

export async function cachedBackend<T>(action: string, payload: Record<string, unknown>) {
  const key = `${action}:${stableStringify(payload)}`;
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.response as ApiResponse<T>;

  const response = await callBackend<T>(action, payload);
  if (response.success) {
    cache.set(key, {
      expiresAt: Date.now() + LIST_TTL_MS,
      response: response as ApiResponse<unknown>
    });
  }
  return response;
}

export function clearBackendCache() {
  cache.clear();
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
