import { NextRequest, NextResponse } from "next/server";

// Basic認証のチェック
function checkBasicAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [user, password] = credentials.split(':');

  // 環境変数から認証情報を取得
  const validUser = process.env.BASIC_AUTH_USER;
  const validPassword = process.env.BASIC_AUTH_PASSWORD;

  return user === validUser && password === validPassword;
}

// Basic認証が必要かどうかを判定
function requiresBasicAuth(req: NextRequest): boolean {
  const host = req.headers.get('host') || '';

  // 本番ドメインではBasic認証をスキップ
  if (host.includes('ooya.tech')) {
    return false;
  }

  // localhostでもスキップ
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return false;
  }

  // Basic認証が設定されていない場合はスキップ
  if (!process.env.BASIC_AUTH_USER || !process.env.BASIC_AUTH_PASSWORD) {
    return false;
  }

  // Vercelプレビュー環境等ではBasic認証を要求
  return true;
}

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function hasNeonAuthEnv() {
  return Boolean(process.env.NEXT_PUBLIC_NEON_AUTH_URL);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // APIルートとstaticファイルはBasic認証をスキップ
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Basic認証チェック（Vercelプレビュー環境用）
  if (requiresBasicAuth(req)) {
    if (!checkBasicAuth(req)) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Preview Environment"',
        },
      });
    }
  }

  const res = NextResponse.next();

  // Protect gated routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/billing")) {
    if (hasNeonAuthEnv()) {
      return res;
    }

    if (hasSupabaseEnv()) {
      return res;
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Basic認証用：全ページ対象（APIとstaticは除外）
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};
