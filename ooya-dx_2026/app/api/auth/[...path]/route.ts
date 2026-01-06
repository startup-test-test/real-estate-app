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
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return testResponse("GET", params.path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return testResponse("POST", params.path);
}

// 動的レンダリングを強制
export const dynamic = "force-dynamic";
