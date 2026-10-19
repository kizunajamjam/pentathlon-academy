import "server-only";

import { headers } from "next/headers";

/*
 * メールのリンク（パスワード再設定・メールアドレス変更の確認）まわりの共通処理。
 */

// メールのリンクで何をしに来たか。戻り先はこれで決め、URL からは受け取らない
export type AuthLinkFlow = "reset" | "email";

/*
 * メールに載せる戻り先 URL（/admin/auth/callback）。
 *
 * 本番は NEXT_PUBLIC_SITE_URL を使う。アクセスされたホスト名をそのまま使うと、
 * 偽のホスト名で再設定を申し込まれたときに、よそのサイトへのリンクが載ってしまうため。
 * 未設定（手元の開発）のときだけアクセス元を使う。どちらの場合も、
 * Supabase の Redirect URLs に無いアドレスは Supabase 側で弾かれる（docs/SETUP.md）。
 */
export async function authCallbackUrl(flow: AuthLinkFlow): Promise<string> {
  let origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!origin) {
    const h = await headers();
    origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  }
  return `${origin}/admin/auth/callback?flow=${flow}`;
}

// 二段階認証のあとの戻り先。管理画面の中のパスだけを通す（よそのサイトへ飛ばされないように）
export function safeAdminPath(path: string | null | undefined): string {
  if (path && /^\/admin(\/[\w-]+)*$/.test(path)) return path;
  return "/admin";
}
