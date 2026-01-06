import type { AuthUser } from "../types";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function mapUser(u: any | null): AuthUser | null {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email ?? null,
    displayName: u.user_metadata?.full_name ?? null,
    primaryEmailVerified: u.email_confirmed_at ? true : null,
  };
}

export async function getServerUser(): Promise<AuthUser | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const store = await cookies();
  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        store.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        store.set({ name, value: "", ...options });
      },
    },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return mapUser(data.user);
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service)
    return {
      ok: false,
      error:
        "Supabaseの設定が未完了です (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)",
      status: 503,
    };
  try {
    const supabase = createClient(url, service);
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) return { ok: false, error: error.message, status: 502 };
    return { ok: true };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message || "Supabaseユーザー削除に失敗しました",
      status: 502,
    };
  }
}
