import { NextRequest } from "next/server";
import { handleList } from "@/lib/apiRoute";

export async function GET(request: NextRequest) {
  return handleList("GET_STORE_DAILY_SUMMARY", request);
}
