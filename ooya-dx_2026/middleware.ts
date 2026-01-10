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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // APIルートはBasic認証をスキップ
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
     */
    "/((?!_next/static|_next/image|favicon.ico|img/).*)",
  ],
};
