import { NextResponse } from "next/server";

// GET /api/simulations/test - テスト用エンドポイント
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: "Test route works!",
    timestamp: new Date().toISOString()
  });
}

export const dynamic = "force-dynamic";
