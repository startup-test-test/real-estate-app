import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 認証チェック
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URLが指定されていません" }, { status: 400 });
    }

    // Vercel BlobのURLかどうか確認
    if (!url.includes("blob.vercel-storage.com")) {
      return NextResponse.json({ error: "無効なURLです" }, { status: 400 });
    }

    // 自分の画像のみ削除可能（URLにユーザーIDが含まれているか確認）
    if (!url.includes(`property-images/${user.id}/`)) {
      return NextResponse.json(
        { error: "この画像を削除する権限がありません" },
        { status: 403 }
      );
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
