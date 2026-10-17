import "server-only";

import { createClient } from "@supabase/supabase-js";

/*
 * 公開ページ用の Supabase クライアント（ログイン情報を使わない、匿名の読み取り専用）。
 *
 * server.ts の createClient は Cookie（ログイン情報）を読むため、それを使うページは
 * アクセスのたびに作り直しになり、表示が遅くなる。公開ページで読むのは誰でも見られる
 * データだけ（RLS で公開済みのものに限られる）なので、Cookie を使わないこちらで読み、
 * ページを使い回せるようにする（(site)/layout.tsx の revalidate）。
 * 管理画面での更新は、各 Server Action の revalidatePath ですぐ反映される。
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
