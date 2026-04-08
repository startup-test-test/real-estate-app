import { NextRequest, NextResponse } from "next/server";

function hasNeonAuthEnv() {
  // NEXT_PUBLIC_NEON_AUTH_URLでチェック（next.config.mjsでNEON_AUTH_BASE_URLに自動コピー）
  return Boolean(process.env.NEXT_PUBLIC_NEON_AUTH_URL);
}

// Basic認証チェック（プレビュー環境用）
function checkBasicAuth(req: NextRequest): NextResponse | null {
  const basicUser = process.env.BASIC_AUTH_USER;
  const basicPassword = process.env.BASIC_AUTH_PASSWORD;

  // 環境変数が設定されていない場合はBasic認証をスキップ
  if (!basicUser || !basicPassword) {
    return null;
  }

  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = atob(base64Credentials);
  const [user, password] = credentials.split(":");

  if (user !== basicUser || password !== basicPassword) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  return null; // 認証成功
}

// メンテナンスページHTML
function maintenanceHtml(): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>メンテナンス中 | 大家DX</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
      background: #f8fafc;
      color: #334155;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
    }
    .container {
      text-align: center;
      max-width: 520px;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1rem;
      line-height: 1.8;
      color: #64748b;
      margin-bottom: 0.5rem;
    }
    .date {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 600;
      font-size: 0.95rem;
      padding: 0.5rem 1.25rem;
      border-radius: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .note {
      margin-top: 2rem;
      font-size: 0.875rem;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔧</div>
    <h1>ただいまメンテナンス中です</h1>
    <p class="date">2026年4月8日（水）よりメンテナンスを実施中</p>
    <p>サービス改善のため、一時的にメンテナンスを行っております。</p>
    <p>ご不便をおかけし申し訳ございません。</p>
    <p class="note">しばらくお待ちいただき、再度アクセスしてください。</p>
  </div>
</body>
</html>`;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get('host') || '';

  // メンテナンスモード（解除する時はこのブロックをコメントアウトしてください）
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/_next/")) {
    return new NextResponse(maintenanceHtml(), {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": "3600",
      },
    });
  }

  // www → non-www リダイレクト（SEO正規化）
  if (host.startsWith('www.')) {
    const newHost = host.replace('www.', '');
    const url = new URL(req.url);
    url.host = newHost;
    return NextResponse.redirect(url, 301);
  }

  // Auth APIルートはBasic認証をスキップし、Authorizationヘッダーも除去
  if (pathname.startsWith("/api/auth/")) {
    // ブラウザがキャッシュしたBasic認証ヘッダーを除去
    const headers = new Headers(req.headers);
    headers.delete("authorization");
    return NextResponse.next({
      request: {
        headers,
      },
    });
  }

  // その他のAPIルートはBasic認証をスキップ
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Basic認証チェック（プレビュー環境用）
  const basicAuthResponse = checkBasicAuth(req);
  if (basicAuthResponse) {
    return basicAuthResponse;
  }

  const res = NextResponse.next();

  // Protect gated routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/billing")) {
    // Neon Auth: セッションチェックはサーバーコンポーネントで行うため、
    // ミドルウェアでは基本的にスルーする（クッキーベースのセッション管理）
    if (hasNeonAuthEnv()) {
      // Neon Auth uses cookie-based sessions handled by the API routes
      // Let the page/server component handle auth checks
      return res;
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - img (public images)
     * - icons (PWA icons)
     */
    "/((?!_next/static|_next/image|favicon.ico|img/|images/|icons/).*)",
  ],
};
