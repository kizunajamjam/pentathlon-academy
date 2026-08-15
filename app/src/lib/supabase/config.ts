/*
 * Supabase プロジェクトを作る前でもサイトを表示できるようにするためのフラグ。
 *
 * 環境変数が未設定のうちは lib/db/* が seed.ts の仮データを返す。
 * .env.local に URL と anon key を入れた時点で、コードを変えずに DB 参照へ切り替わる。
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
