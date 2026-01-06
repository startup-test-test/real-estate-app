import { createAuthServer } from "@neondatabase/neon-js/auth/next/server";
import type { AuthUser } from "../types";

function mapUser(session: any | null): AuthUser | null {
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    email: u.email ?? null,
    displayName: u.name ?? null,
    primaryEmailVerified: Boolean(u.emailVerified),
  };
}

export async function getServerUser(): Promise<AuthUser | null> {
  // NEXT_PUBLIC_NEON_AUTH_URLでNeon Authの有効化を判定
  // (next.config.mjsでNEON_AUTH_BASE_URLに自動コピーされる)
  if (!process.env.NEXT_PUBLIC_NEON_AUTH_URL) {
    return null;
  }

  try {
    const authServer = createAuthServer();
    const { data: session } = await authServer.getSession();
    return mapUser(session);
  } catch (e) {
    console.error("[Neon Auth] getServerUser error:", e);
    return null;
  }
}

export async function requireUser(opts?: {
  redirect?: (url: string) => never;
}) {
  const u = await getServerUser();
  if (!u) {
    if (opts?.redirect) return opts.redirect("/auth/signup");
    throw new Error("Unauthorized");
  }
  return u;
}

export async function deleteUser(
  userId: string
): Promise<{ ok: boolean; error?: string; status?: number }> {
  // Neon API を使ってユーザーを削除
  // https://api-docs.neon.tech/reference/deletebranchneonauthuser
  //
  // 必要な環境変数:
  // - NEON_API_TOKEN: Neon Personal API Key
  // - NEON_PROJECT_ID: Neon プロジェクトID
  // - NEON_BRANCH_ID: ブランチID（オプション、デフォルト: main）

  const apiToken = process.env.NEON_API_TOKEN;
  const projectId = process.env.NEON_PROJECT_ID;
  const branchId = process.env.NEON_BRANCH_ID || "main";

  if (!apiToken || !projectId) {
    console.log(
      "[Neon Auth] deleteUser: skipped (NEON_API_TOKEN or NEON_PROJECT_ID not set)"
    );
    // 環境変数未設定の場合はスキップして成功を返す（後方互換性）
    return { ok: true };
  }

  try {
    const url = `https://console.neon.tech/api/v2/projects/${projectId}/branches/${branchId}/auth/users/${userId}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[Neon Auth] deleteUser failed:", res.status, text);
      // 404 はユーザーが既に削除されている可能性があるため成功扱い
      if (res.status === 404) {
        return { ok: true };
      }
      return {
        ok: false,
        error: `ユーザー削除に失敗しました (${res.status})`,
        status: res.status,
      };
    }

    console.log("[Neon Auth] deleteUser: success");
    return { ok: true };
  } catch (e) {
    console.error("[Neon Auth] deleteUser error:", e);
    return { ok: false, error: "ユーザー削除に失敗しました", status: 502 };
  }
}
