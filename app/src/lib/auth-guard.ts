import "server-only";

import { redirect } from "next/navigation";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { StaffRole } from "@/lib/staff-roles";

export type StaffContext = { userId: string; name: string; email: string; role: StaffRole };

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
    .select("user_id, name, role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return { state: "none" };

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") return { state: "mfa" };

  return {
    state: "ok",
    staff: {
      userId: user.id,
      name: data.name,
      email: user.email ?? "",
      role: data.role === "admin" ? "admin" : "editor",
    },
  };
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

// 管理者だけのページ用: 編集者はダッシュボードへ戻す
export async function requireAdmin(): Promise<StaffContext> {
  const staff = await requireStaff();
  if (staff.role !== "admin") redirect("/admin");
  return staff;
}

// 管理者だけの Server Action 用
export async function getAdminForAction(): Promise<StaffContext | null> {
  const staff = await getStaffForAction();
  return staff?.role === "admin" ? staff : null;
}

// 二段階認証の画面用: パスワードは通っていて staff に登録されているか（aal は問わない）
export async function isStaffPendingMfa(): Promise<"ok" | "mfa" | "none"> {
  return (await checkStaff()).state;
}

// パスワード再設定・招待のリンクから入ったあと、今のパスワードなしで変更できる時間
// （認証アプリを入れて登録するまでの時間も含むので、少し長めにとる）
export const RECOVERY_WINDOW_MIN = 30;

// 今のパスワードなしで変更してよいログイン方法（Supabase がセッションに記録する amr）。
// メールアドレス変更の確認リンクなど、ほかのメールのリンクでは許さない
const RECOVERY_METHODS = new Set(["recovery", "invite"]);

/*
 * パスワード再設定・招待のメールのリンクから入ったばかりか。
 *
 * そのリンクでログインし、二段階認証も済ませていて、リンクを開いてから30分以内なら、
 * 今のパスワードを聞かずに変更できる（忘れた人の再設定と、招待された人の最初の設定）。
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
  if (!firstFactor || !RECOVERY_METHODS.has(firstFactor.method)) return false;
  return Date.now() / 1000 - firstFactor.timestamp < RECOVERY_WINDOW_MIN * 60;
}
