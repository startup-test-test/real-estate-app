import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "test works", timestamp: new Date().toISOString() });
}

export const dynamic = "force-dynamic";
