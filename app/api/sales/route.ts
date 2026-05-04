import { NextRequest } from "next/server";
import { handleList, handleWrite } from "@/lib/apiRoute";

export async function GET(request: NextRequest) {
  return handleList("LIST_SALES", request);
}

export async function POST(request: NextRequest) {
  return handleWrite("REGISTER_SALE", request);
}
