export function hasAuthEnv() {
  // NEXT_PUBLIC_ 環境変数はクライアント/サーバー両方でアクセス可能
  const hasNeonAuth = Boolean(process.env.NEXT_PUBLIC_NEON_AUTH_URL);
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return hasNeonAuth || hasSupabase;
}
