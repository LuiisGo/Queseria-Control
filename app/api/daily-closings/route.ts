import { NextRequest } from "next/server";
import { handleWrite } from "@/lib/apiRoute";

export async function POST(request: NextRequest) {
  return handleWrite("REGISTER_DAILY_CLOSING", request);
}
