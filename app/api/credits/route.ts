import { NextRequest } from "next/server";
import { handleList, handleWrite } from "@/lib/apiRoute";

export async function GET(request: NextRequest) {
  return handleList("LIST_CREDITS", request);
}

export async function POST(request: NextRequest) {
  const body = (await request.clone().json().catch(() => ({}))) as Record<string, unknown>;
  return handleWrite(body.id ? "UPDATE_CREDIT" : "REGISTER_CREDIT_PAYMENT", request);
}
