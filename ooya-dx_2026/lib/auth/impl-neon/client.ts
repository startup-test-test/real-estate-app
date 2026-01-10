"use client";
/* eslint-disable react-hooks/rules-of-hooks */

import { createAuthClient } from "@neondatabase/neon-js/auth/next";
import { useMemo } from "react";
import type { AuthClient, AuthUser } from "../types";

// シングルトンのauthClient
const authClient = typeof window !== "undefined" ? createAuthClient() : null;

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

export function useAuth(): AuthClient {
  const envReady = Boolean(process.env.NEXT_PUBLIC_NEON_AUTH_URL);

  if (!envReady || !authClient) {
    return {
      user: null,
      isLoading: false,
      error: null,
      async signIn() {
        return { ok: false, error: "NEON_AUTH_ENV_MISSING" };
      },
      async signUp() {
        return { ok: false, error: "NEON_AUTH_ENV_MISSING" };
      },
      async signOut() {
        /* no-op */
      },
      async signInWithGoogle() {
        throw new Error("NEON_AUTH_ENV_MISSING");
      },
      async sendPasswordReset() {
        return { ok: false, error: "NEON_AUTH_ENV_MISSING" };
      },
    };
  }

  const { data: session, isPending, error } = authClient.useSession();

  const user = useMemo(() => mapUser(session), [session]);

  return {
    user,
    isLoading: isPending,
    error: error?.message ?? null,
    async signIn({ email, password }) {
      try {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) {
          return { ok: false, error: result.error.message || "SIGN_IN_FAILED" };
        }
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e?.message || "SIGN_IN_FAILED" };
      }
    },
    async signUp({ email, password }) {
      try {
        console.log("[Auth] signUp called with:", { email, name: email.split("@")[0] });
        const result = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0], // デフォルト名としてメールのローカル部分を使用
        });
        console.log("[Auth] signUp result:", result);
        if (result.error) {
          console.log("[Auth] signUp error:", result.error);
          return { ok: false, error: result.error.message || result.error.code || "SIGN_UP_FAILED" };
        }
        return { ok: true };
      } catch (e: any) {
        console.error("[Auth] signUp exception:", e);
        return { ok: false, error: e?.message || "SIGN_UP_FAILED" };
      }
    },
    async signOut() {
      try {
        await authClient.signOut();
      } catch {
        // ignore
      }
    },
    async signInWithGoogle() {
      await authClient.signIn.social({ provider: "google" });
    },
    async sendPasswordReset(email: string) {
      try {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const result = await authClient.requestPasswordReset({
          email,
          redirectTo: `${origin}/auth/neon-password-reset`,
        });
        if (result.error) {
          return { ok: false, error: result.error.message || "RESET_FAILED" };
        }
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e?.message || "RESET_FAILED" };
      }
    },
    async deleteUser() {
      try {
        const result = await authClient.deleteUser();
        if (result.error) {
          return { ok: false, error: result.error.message || "DELETE_FAILED" };
        }
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e?.message || "DELETE_FAILED" };
      }
    },
  };
}
