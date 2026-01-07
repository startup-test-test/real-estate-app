import { NextRequest, NextResponse } from "next/server";
import { authApiHandler } from "@neondatabase/neon-js/auth/next/server";

// Neon Auth APIハンドラーを取得
const handlers = authApiHandler();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  if (!handlers.GET) {
    return NextResponse.json({ error: "GET not supported" }, { status: 405 });
  }
  return handlers.GET(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  if (!handlers.POST) {
    return NextResponse.json({ error: "POST not supported" }, { status: 405 });
  }
  return handlers.POST(request, context);
}

// 動的レンダリングを強制
export const dynamic = "force-dynamic";
