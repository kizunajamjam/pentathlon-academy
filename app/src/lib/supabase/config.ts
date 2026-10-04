/*
 * Supabase プロジェクトを作る前でもサイトを表示できるようにするためのフラグ。
 *
 * 環境変数が未設定のうちは lib/db/* が seed.ts の仮データを返す。
 * .env.local に URL と anon key を入れた時点で、コードを変えずに DB 参照へ切り替わる。
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/*
 * 本番ビルドで環境変数が抜けていると、仮データ(偽の大会日程など)を
 * 黙って公開してしまう。それを避けるため、確認用プレビュー
 * (NEXT_PUBLIC_IS_PREVIEW=1)以外の本番ビルドでは、ここで失敗させる。
 */
if (
  !isSupabaseConfigured &&
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_IS_PREVIEW !== "1"
) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です。" +
      "仮データを本番に出さないため、ビルドを中止します。" +
      "確認用プレビューなら NEXT_PUBLIC_IS_PREVIEW=1 を指定してください。",
  );
}
