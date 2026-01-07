import { authApiHandler } from "@neondatabase/neon-js/auth/next/server";

// Neon Auth APIハンドラー
// NEON_AUTH_BASE_URLはnext.config.mjsでNEXT_PUBLIC_NEON_AUTH_URLから自動設定される
export const { GET, POST, PUT, DELETE, PATCH } = authApiHandler();

// 動的レンダリングを強制
export const dynamic = "force-dynamic";
