import { NextRequest, NextResponse } from "next/server";

function hasNeonAuthEnv() {
  // NEXT_PUBLIC_NEON_AUTH_URLでチェック（next.config.mjsでNEON_AUTH_BASE_URLに自動コピー）
  return Boolean(process.env.NEXT_PUBLIC_NEON_AUTH_URL);
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

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

export const config = { matcher: ["/dashboard/:path*", "/billing/:path*"] };
