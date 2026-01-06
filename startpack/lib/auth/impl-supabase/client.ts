"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import type { AuthClient, AuthUser } from "../types";

let supabase: SupabaseClient | null = null;
function getClient() {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase環境変数が未設定です。NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。"
    );
  }
  // Browser client that keeps cookies in sync for SSR/middleware
  supabase = createBrowserClient(url, anon);
  return supabase;
}

function mapUser(u: any | null): AuthUser | null {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email ?? null,
    displayName: u.user_metadata?.full_name ?? null,
    primaryEmailVerified: u.email_confirmed_at ? true : null,
  };
}

export function useAuth(): AuthClient {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const client = getClient();
    client.auth.getUser().then(({ data, error }: any) => {
      if (!mounted) return;
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      setUser(mapUser(data.user));
      setIsLoading(false);
    });
    const sub = client.auth.onAuthStateChange((_ev: any, session: any) => {
      setUser(mapUser(session?.user ?? null));
    });
    return () => {
      mounted = false;
      sub.data.subscription.unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({
      user,
      isLoading,
      error,
      async signIn({ email, password }) {
        const { error } = await getClient().auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },
      async signUp({ email, password }) {
        const { error } = await getClient().auth.signUp({ email, password });
        if (error) return { ok: false, error: error.message };
        return { ok: true, info: "verification_sent" };
      },
      async signOut() {
        await getClient().auth.signOut();
      },
      async signInWithGoogle() {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const { error } = await getClient().auth.signInWithOAuth({
          provider: "google",
          options: origin ? { redirectTo: `${origin}/dashboard` } : undefined,
        });
        if (error) throw error;
      },
      async sendPasswordReset(email: string) {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const { error } = await getClient().auth.resetPasswordForEmail(
          email,
          origin
            ? { redirectTo: `${origin}/auth/password-reset` }
            : (undefined as any)
        );
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },
      async resendEmailVerification() {
        const emailAddr = user?.email;
        if (!emailAddr) return { ok: false, error: "NO_EMAIL" };
        const { error } = await getClient().auth.resend({
          type: "signup",
          email: emailAddr,
        });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },
    }),
    [user, isLoading, error]
  );
}
