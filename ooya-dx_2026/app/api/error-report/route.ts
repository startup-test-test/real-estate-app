import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

// レートリミット（同じエラーの連続通知を防ぐ）
const ERROR_COOLDOWN_MS = 60_000; // 1分間は同じエラーを送信しない
type ErrorEntry = { lastSent: number };
const _global = globalThis as unknown as {
  __errorReportStore?: Map<string, ErrorEntry>;
};
const errorStore: Map<string, ErrorEntry> =
  _global.__errorReportStore || new Map();
if (process.env.NODE_ENV !== "production") {
  _global.__errorReportStore = errorStore;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, stack, digest, url, userAgent, timestamp } = body;

    // エラーメッセージのハッシュでレートリミット
    const errorKey = `${message}:${url}`;
    const now = Date.now();
    const existing = errorStore.get(errorKey);

    if (existing && now - existing.lastSent < ERROR_COOLDOWN_MS) {
      // クールダウン中はスキップ
      return NextResponse.json({ success: true, skipped: true });
    }

    errorStore.set(errorKey, { lastSent: now });

    // 環境変数チェック
    if (!process.env.RESEND_API_KEY) {
      console.error("[Error Report] RESEND_API_KEY is not set");
      return NextResponse.json({ success: false }, { status: 503 });
    }

    const toEmail = process.env.ERROR_NOTIFICATION_EMAIL || process.env.CONTACT_EMAIL;
    if (!toEmail) {
      console.error("[Error Report] No notification email configured");
      return NextResponse.json({ success: false }, { status: 503 });
    }

    // 開発環境ではメール送信をスキップ
    if (process.env.NODE_ENV === "development" && process.env.SKIP_ERROR_EMAIL !== "false") {
      console.log("[Error Report] Skipping email in development:", { message, url });
      return NextResponse.json({ success: true, skipped: true });
    }

    const { error } = await getResend().emails.send({
      from: `大家DX エラー通知 <noreply@ooya.tech>`,
      to: toEmail,
      subject: `[エラー発生] ${message?.substring(0, 50) || "Unknown Error"}`,
      text: `大家DXでエラーが発生しました

発生日時: ${timestamp || new Date().toISOString()}
URL: ${url || "不明"}

エラーメッセージ:
${message || "不明"}

スタックトレース:
${stack || "なし"}

Error ID: ${digest || "なし"}

User Agent:
${userAgent || "不明"}

---
このメールは自動送信されています。`,
    });

    if (error) {
      console.error("[Error Report] Failed to send:", error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Error Report] Exception:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
