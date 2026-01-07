import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 400 });
    }

    // ファイルタイプの検証
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "JPEG、PNG、WebP形式の画像ファイルのみアップロード可能です" },
        { status: 400 }
      );
    }

    // ファイルサイズの検証（5MB以下）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "ファイルサイズは5MB以下にしてください" },
        { status: 400 }
      );
    }

    // ファイル名を生成
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `property-images/${timestamp}-${randomString}.${extension}`;

    // Vercel Blobにアップロード
    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error("Blob upload error:", error);
    return NextResponse.json(
      { error: "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
