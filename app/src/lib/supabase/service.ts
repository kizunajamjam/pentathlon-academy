import "server-only";

import { createClient } from "@supabase/supabase-js";

/*
 * service_role キーで動く Supabase クライアント。RLS を迂回する。
 *
 * お問い合わせの保存にだけ使う。これで匿名ユーザーに insert 権限を渡さずに済む
 * （docs/SETUP.md の「お問い合わせの強化」参照）。キーが無ければ null を返し、
 * 呼び出し側は従来どおり anon の insert にフォールバックする。
 * キーは絶対に NEXT_PUBLIC_ を付けない・クライアントへ渡さないこと。
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!key || !url) return null;

  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
