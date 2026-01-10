import { NextRequest, NextResponse } from "next/server";

// 環境変数がない場合は503を返す
function notConfiguredResponse() {
  return NextResponse.json(
    {
      error:
        "Neon Auth is not configured. Set NEXT_PUBLIC_NEON_AUTH_URL environment variable.",
    },
    { status: 503 }
  );
}

// Basic認証ヘッダーを除去したリクエストを作成
// プレビュー環境でブラウザがキャッシュしたBasic認証ヘッダーがNeon Authに送られると403エラーになる
function createCleanHeadersProxy(originalHeaders: Headers): Headers {
  const cleanHeaders = new Headers();
  originalHeaders.forEach((value, key) => {
    // Basic認証ヘッダーを除外
    if (key.toLowerCase() !== "authorization" || !value.startsWith("Basic ")) {
      cleanHeaders.set(key, value);
    }
  });
  return cleanHeaders;
}

function stripBasicAuthHeader(request: NextRequest): NextRequest {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return request;
  }

  // Proxyを使ってheadersアクセスをインターセプト
  const cleanHeaders = createCleanHeadersProxy(request.headers);

  return new Proxy(request, {
    get(target, prop) {
      if (prop === "headers") {
        return cleanHeaders;
      }
      const value = target[prop as keyof NextRequest];
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
  }) as NextRequest;
}

// 動的インポートで環境変数チェック後にのみロード
// NEXT_PUBLIC_NEON_AUTH_URLはnext.config.mjsでNEON_AUTH_BASE_URLに自動コピーされる
async function getHandler() {
  if (!process.env.NEXT_PUBLIC_NEON_AUTH_URL) {
    return null;
  }
  const { authApiHandler } =
    await import("@neondatabase/neon-js/auth/next/server");
  return authApiHandler();
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ all: string[] }> }
) {
  const handlers = await getHandler();
  if (!handlers) return notConfiguredResponse();
  const params = await context.params;
  const cleanRequest = stripBasicAuthHeader(request);
  return handlers.GET(cleanRequest, {
    params: Promise.resolve({ path: params.all }),
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ all: string[] }> }
) {
  const handlers = await getHandler();
  if (!handlers) return notConfiguredResponse();
  const params = await context.params;
  const cleanRequest = stripBasicAuthHeader(request);
  return handlers.POST(cleanRequest, {
    params: Promise.resolve({ path: params.all }),
  });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ all: string[] }> }
) {
  const handlers = await getHandler();
  if (!handlers) return notConfiguredResponse();
  const params = await context.params;
  const cleanRequest = stripBasicAuthHeader(request);
  return handlers.PUT(cleanRequest, {
    params: Promise.resolve({ path: params.all }),
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ all: string[] }> }
) {
  const handlers = await getHandler();
  if (!handlers) return notConfiguredResponse();
  const params = await context.params;
  const cleanRequest = stripBasicAuthHeader(request);
  return handlers.DELETE(cleanRequest, {
    params: Promise.resolve({ path: params.all }),
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ all: string[] }> }
) {
  const handlers = await getHandler();
  if (!handlers) return notConfiguredResponse();
  const params = await context.params;
  const cleanRequest = stripBasicAuthHeader(request);
  return handlers.PATCH(cleanRequest, {
    params: Promise.resolve({ path: params.all }),
  });
}

// 動的レンダリングを強制
export const dynamic = "force-dynamic";
