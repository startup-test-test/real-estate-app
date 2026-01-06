#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  ".."
);

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function replaceFacades(provider) {
  const base = path.join(root, "lib", "auth");
  const map = {
    neon: {
      client: "export { useAuth } from './impl-neon/client'\n",
      server:
        "export { getServerUser, requireUser, deleteUser } from './impl-neon/server'\n",
      provider: "export { AuthProvider } from './impl-neon/Provider'\n",
    },
    supabase: {
      client: "export { useAuth } from './impl-supabase/client'\n",
      server:
        "export { getServerUser, requireUser, deleteUser } from './impl-supabase/server'\n",
      provider: "export { AuthProvider } from './impl-supabase/Provider'\n",
    },
  };
  const target = map[provider];
  writeFile(path.join(base, "client.ts"), target.client);
  writeFile(path.join(base, "server.ts"), target.server);
  writeFile(path.join(base, "Provider.tsx"), target.provider);
}

function setMiddleware(provider) {
  const file = path.join(root, "middleware.ts");
  if (provider === "supabase") {
    const code = `import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/billing")) {
    if (hasSupabaseEnv()) {
      // Supabase: let pages handle auth to avoid SSR cookie mismatch
      return res;
    }
  }

  return res;
}

export const config = { matcher: ["/dashboard/:path*", "/billing/:path*"] };
`;
    writeFile(file, code);
  } else if (provider === "neon") {
    const neonContent = `import { NextRequest, NextResponse } from "next/server";

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
`;
    writeFile(file, neonContent);
  }
}

function writeSupabasePasswordResetPage() {
  const file = path.join(root, "app", "auth", "password-reset", "page.tsx");
  const code = `"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function SupabasePasswordResetPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  function getClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) return null
    return createBrowserClient(url, anon)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const client = getClient()
      if (!client) return
      const { data } = await client.auth.getSession()
      if (!mounted) return
      setSessionReady(Boolean(data.session))
    })()
    return () => { mounted = false }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      return
    }
    if (password !== confirm) {
      setError('確認用パスワードが一致しません')
      return
    }
    setIsLoading(true)
    try {
      const client = getClient()
      if (!client) throw new Error('SUPABASE_NOT_CONFIGURED')
      const { error } = await client.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (e: any) {
      setError(e?.message || 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-start justify-center pt-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl px-5 py-4">
          <div className="text-center mb-4">
            <h1 className="text-lg font-medium text-slate-800">パスワードをリセット</h1>
          </div>

          {!sessionReady && !success && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 mb-3">
              リセットリンクからアクセスしてください。リンクの有効期限が切れている可能性があります。
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-sm text-slate-700 mb-4">パスワードを更新しました。</p>
              <Link href="/dashboard" className="px-3 py-2 rounded bg-blue-600 text-white text-sm inline-block">ダッシュボードへ</Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">新しいパスワード</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  placeholder="8文字以上"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">新しいパスワード（確認）</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  placeholder="もう一度入力"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading || !sessionReady}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '更新中...' : 'パスワードを更新'}
              </button>

              <div className="mt-2 text-center">
                <Link href="/auth/signin" className="text-xs text-blue-600 hover:text-blue-700">← ログイン画面に戻る</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
`;
  writeFile(file, code);
}

function deletePathIfExists(p) {
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) fs.rmSync(p, { recursive: true, force: true });
    else fs.rmSync(p);
  }
}

function cleanupFiles(provider) {
  if (provider === "supabase") {
    // Remove Neon specific files
    deletePathIfExists(path.join(root, "app", "handler"));
    deletePathIfExists(path.join(root, "lib", "stack.ts"));
  }
}

function mutateDependencies(provider) {
  const pkgFile = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["startpack:init"] = "node scripts/startpack-init.mjs";

  pkg.dependencies = pkg.dependencies || {};
  if (provider === "supabase") {
    // add supabase, remove neon-js
    if (!pkg.dependencies["@supabase/supabase-js"]) {
      pkg.dependencies["@supabase/supabase-js"] = "^2.89.0";
    }
    if (!pkg.dependencies["@supabase/ssr"]) {
      pkg.dependencies["@supabase/ssr"] = "^0.8.0";
    }
    // Remove Neon Auth dependencies
    if (pkg.dependencies["@neondatabase/neon-js"])
      delete pkg.dependencies["@neondatabase/neon-js"];
    if (pkg.dependencies["@stackframe/stack"])
      delete pkg.dependencies["@stackframe/stack"];
  } else if (provider === "neon") {
    // remove supabase
    if (pkg.dependencies["@supabase/supabase-js"])
      delete pkg.dependencies["@supabase/supabase-js"];
    if (pkg.dependencies["@supabase/ssr"])
      delete pkg.dependencies["@supabase/ssr"];
    // ensure neon-js dependency exists
    if (!pkg.dependencies["@neondatabase/neon-js"]) {
      pkg.dependencies["@neondatabase/neon-js"] = "^0.1.0-beta.18";
    }
    // Remove old stack dependency if exists
    if (pkg.dependencies["@stackframe/stack"])
      delete pkg.dependencies["@stackframe/stack"];
  }
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const ask = (q) => new Promise((res) => rl.question(q, res));
  console.log("StartPack init: 認証プロバイダを選択してください");
  console.log("1) Neon（Better Auth）\n2) Supabase Auth");
  const ans = (await ask("番号を入力 [1/2]: ")).trim();
  const provider = ans === "2" ? "supabase" : "neon";
  rl.close();

  replaceFacades(provider);
  setMiddleware(provider);
  cleanupFiles(provider);
  mutateDependencies(provider);

  // Prune files of the non-selected provider for a cleaner structure
  if (provider === "neon") {
    deletePathIfExists(path.join(root, "lib", "auth", "impl-supabase"));
    deletePathIfExists(path.join(root, "app", "auth", "password-reset"));
    deletePathIfExists(path.join(root, "types", "shims-supabase.d.ts"));
    // Remove old Stack Auth files if they exist
    deletePathIfExists(path.join(root, "lib", "stack.ts"));
    deletePathIfExists(path.join(root, "app", "handler"));
    deletePathIfExists(path.join(root, "types", "shims-stack.d.ts"));
    deletePathIfExists(path.join(root, "stubs"));
  } else if (provider === "supabase") {
    deletePathIfExists(path.join(root, "lib", "auth", "impl-neon"));
    deletePathIfExists(path.join(root, "app", "auth", "neon-password-reset"));
    // Remove Neon Auth API route
    deletePathIfExists(path.join(root, "app", "api", "auth", "[...all]"));
    deletePathIfExists(path.join(root, "app", "api", "auth", "neon"));
    // Remove old Stack Auth files
    deletePathIfExists(path.join(root, "types", "shims-stack.d.ts"));
    deletePathIfExists(path.join(root, "lib", "stack.ts"));
    deletePathIfExists(path.join(root, "app", "handler"));
    deletePathIfExists(path.join(root, "stubs"));
  }

  // Ensure Supabase-specific pages when selected
  if (provider === "supabase") {
    writeSupabasePasswordResetPage();
  }

  console.log(`\n✔ 設定完了: provider=${provider}`);
  console.log("- .env をプロバイダ別テンプレに沿って作成してください:");
  console.log("  - Neon:     cp .env.neon.example .env");
  console.log("  - Supabase: cp .env.supabase.example .env");
  console.log("- 依存をインストール: npm install");
  console.log("- Prisma マイグレーション: npm run db:migrate");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
