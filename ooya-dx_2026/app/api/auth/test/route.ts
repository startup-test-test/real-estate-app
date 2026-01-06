import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Auth API test route working",
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_NEON_AUTH_URL: process.env.NEXT_PUBLIC_NEON_AUTH_URL ? "set" : "not set",
      NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL ? "set" : "not set",
    }
  });
}

export async function POST() {
  return NextResponse.json({
    message: "Auth API POST test working",
  });
}
