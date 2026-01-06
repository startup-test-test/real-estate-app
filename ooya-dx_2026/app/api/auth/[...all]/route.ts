import { NextRequest, NextResponse } from "next/server";

// テスト用のシンプルなレスポンス
function testResponse(method: string, path: string[]) {
  return NextResponse.json({
    message: "Catch-all route is working!",
    method,
    path,
    timestamp: new Date().toISOString(),
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ all: string[] }> }
) {
  const params = await context.params;
  return testResponse("GET", params.all);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ all: string[] }> }
) {
  const params = await context.params;
  return testResponse("POST", params.all);
}

// 動的レンダリングを強制
export const dynamic = "force-dynamic";
