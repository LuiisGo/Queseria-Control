import { NextRequest } from "next/server";
import { handleList, handleWrite } from "@/lib/apiRoute";

export async function GET(request: NextRequest) {
  return handleList("GET_PRICE_HISTORY", request);
}

export async function POST(request: NextRequest) {
  return handleWrite("SET_PRICE", request);
}
