import "server-only";

import { redirect } from "next/navigation";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type StaffContext = { userId: string; name: string; email: string };

type StaffCheck =
  | { state: "ok"; staff: StaffContext }
  // パスワードは通ったが、二段階認証（認証アプリのコード）がまだ
  | { state: "mfa" }
  | { state: "none" };

/*
 * staff テーブルに登録されている user だけを通す。
 * ログイン済みでも staff に無ければ管理画面には入れない。
 *
 * さらに二段階認証を必須にする。パスワードだけのログイン（aal1）では通さず、
 * 認証アプリのコードまで確認できたセッション（aal2）だけを通す。
 * パスワードが漏れても、スマホが無ければ管理画面に入れない。
 * データベース側の is_staff() も aal2 を要求しているので、API を直接叩いても書き込めない。
 */
async function checkStaff(): Promise<StaffCheck> {
  if (!isSupabaseConfigured) return { state: "none" };

  const user = await getCurrentUser();
  if (!user) return { state: "none" };

  const supabase = await createClient();
  const { data } = await supabase
    .from("staff")
    .select("user_id, name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return { state: "none" };

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") return { state: "mfa" };

  return { state: "ok", staff: { userId: user.id, name: data.name, email: user.email ?? "" } };
}

// ページ(Server Component)用: 権限がなければログイン画面へ、二段階認証がまだならコード入力へ送る。
export async function requireStaff(): Promise<StaffContext> {
  const result = await checkStaff();
  if (result.state === "mfa") redirect("/admin/mfa");
  if (result.state !== "ok") redirect("/admin/login");
  return result.staff;
}

// Server Action 用: リダイレクトせず null を返すので、呼び出し側でエラー応答にする。
export async function getStaffForAction(): Promise<StaffContext | null> {
  const result = await checkStaff();
  return result.state === "ok" ? result.staff : null;
}

// 二段階認証の画面用: パスワードは通っていて staff に登録されているか（aal は問わない）
export async function isStaffPendingMfa(): Promise<"ok" | "mfa" | "none"> {
  return (await checkStaff()).state;
}

// パスワード再設定のリンクから入ったあと、今のパスワードなしで変更できる時間
const RECOVERY_WINDOW_SEC = 15 * 60;

/*
 * パスワード再設定・招待のメールのリンクから入ったばかりか。
 *
 * パスワード以外の方法（メールのリンク）でログインし、二段階認証も済ませてから
 * 15分以内なら、今のパスワードを聞かずに変更できる（忘れた人の再設定と、招待された人の最初の設定）。
 * ログイン方法はセッションの記録（amr）から読むので、画面側からはごまかせない。
 */
export async function isRecoveryLogin(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const methods = data?.currentAuthenticationMethods ?? [];
  const firstFactor = methods.find(
    (m): m is { method: string; timestamp: number } =>
      typeof m === "object" && m.method !== "totp" && m.method !== "mfa/totp",
  );
  if (!firstFactor || firstFactor.method === "password") return false;
  return Date.now() / 1000 - firstFactor.timestamp < RECOVERY_WINDOW_SEC;
}
