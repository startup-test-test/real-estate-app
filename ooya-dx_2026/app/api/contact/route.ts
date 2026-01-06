import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

// ===== Rate Limit (固定ウィンドウ) =====
const RATE_LIMIT_WINDOW_MS = Number(
  process.env.CONTACT_RATE_LIMIT_WINDOW_MS || 60_000
);
const RATE_LIMIT_MAX = Number(process.env.CONTACT_RATE_LIMIT_MAX || 5);

type RateLimitEntry = { windowStart: number; count: number };
const _global = globalThis as unknown as {
  __contactRateLimitStore?: Map<string, RateLimitEntry>;
};
const rateLimitStore: Map<string, RateLimitEntry> =
  _global.__contactRateLimitStore || new Map();
if (process.env.NODE_ENV !== "production") {
  _global.__contactRateLimitStore = rateLimitStore;
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function checkAndConsumeRateLimit(key: string) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);
  if (!existing || now - existing.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { windowStart: now, count: 1 });
    return {
      limited: false,
      remaining: Math.max(0, RATE_LIMIT_MAX - 1),
      resetMs: RATE_LIMIT_WINDOW_MS,
    };
  }
  existing.count += 1;
  rateLimitStore.set(key, existing);
  const limited = existing.count > RATE_LIMIT_MAX;
  const remaining = Math.max(0, RATE_LIMIT_MAX - existing.count);
  const resetMs = RATE_LIMIT_WINDOW_MS - (now - existing.windowStart);
  return { limited, remaining, resetMs };
}

export async function POST(request: NextRequest) {
  // レートリミット判定（IP単位）
  const ip = getClientIp(request);
  const { limited, remaining, resetMs } = checkAndConsumeRateLimit(
    `contact:${ip}`
  );
  if (limited) {
    return NextResponse.json(
      {
        error:
          "リクエストが多すぎます。しばらく時間をおいて再度お試しください。",
      },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(resetMs / 1000)) },
      }
    );
  }

  // Resend APIキーが設定されていない場合の警告
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "メール設定が完了していません。管理者にお問い合わせください。" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, message } = body;

    // バリデーション
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "必須項目が入力されていません" },
        { status: 400 }
      );
    }

    // Resendの制限: ドメイン未検証の場合、登録メールアドレスにのみ送信可能
    const toEmail = process.env.CONTACT_EMAIL || "support@example.com";

    // 開発環境でメール送信をスキップするオプション
    if (process.env.SKIP_EMAIL_SEND === "true") {
      const res = NextResponse.json({ success: true });
      res.headers.set("X-RateLimit-Remaining", String(remaining));
      res.headers.set("X-RateLimit-Reset", String(Math.ceil(resetMs / 1000)));
      return res;
    }

    // テキストメール用の基本的なサニタイズ（改行文字の正規化のみ）
    const sanitizeText = (input: string) =>
      String(input).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const safeName = sanitizeText(name);
    const safeEmail = sanitizeText(email);
    const safeMessage = sanitizeText(message);

    // メール送信（テキスト形式）
    const { data, error } = await getResend().emails.send({
      from: `Contact Form <onboarding@resend.dev>`,
      to: toEmail,
      subject: `[お問い合わせ] ${safeName}様からのお問い合わせ`,
      text: `お問い合わせを受信しました

お名前: ${safeName}
メールアドレス: ${safeEmail}

内容:
${safeMessage}

---
このメールは自動送信されています。返信はお客様のメールアドレス宛に直接お送りください。`,
      replyTo: safeEmail,
    });

    if (error) {
      console.error("メール送信エラー:", error.message || error);
      return NextResponse.json(
        {
          error: `メール送信に失敗しました: ${
            error.message || "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    // 自動返信メール（お客様向け・テキスト形式）
    await getResend().emails.send({
      from: `株式会社サンプル <onboarding@resend.dev>`,
      to: safeEmail,
      subject: "お問い合わせを受け付けました",
      text: `${safeName} 様

この度はお問い合わせいただき、誠にありがとうございます。
以下の内容でお問い合わせを受け付けました。

---
内容:
${safeMessage}
---

株式会社サンプル
support@example.com`,
    });

    const res = NextResponse.json({ success: true });
    res.headers.set("X-RateLimit-Remaining", String(remaining));
    res.headers.set("X-RateLimit-Reset", String(Math.ceil(resetMs / 1000)));
    return res;
  } catch (error) {
    console.error("お問い合わせ処理エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
