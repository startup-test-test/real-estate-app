import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URLが指定されていません" }, { status: 400 });
    }

    // Vercel BlobのURLかどうか確認
    if (!url.includes("blob.vercel-storage.com")) {
      return NextResponse.json({ error: "無効なURLです" }, { status: 400 });
    }

    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Blob delete error:", error);
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
