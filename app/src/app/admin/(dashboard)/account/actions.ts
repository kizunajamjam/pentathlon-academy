"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getStaffForAction, isRecoveryLogin } from "@/lib/auth-guard";
import { authCallbackUrl } from "@/lib/auth-links";
import { createClient } from "@/lib/supabase/server";

export type AccountState = { message?: string; done?: string };

// 管理画面のパスワードは12文字以上（docs/RELEASE.md の Supabase 側の設定と合わせる）
const MIN_PASSWORD = 12;

const RELOGIN = { message: "ログインの有効期限が切れました。ページを読み込み直して、ログインし直してください。" };

/*
 * 今のパスワードが正しいかを確かめる。
 *
 * ログイン中のセッションで signInWithPassword を呼ぶと、二段階認証が済んだ状態が
 * パスワードだけの状態に戻ってしまう。そこで Cookie を使わない別のクライアントで確かめ、
 * 確認用にできたセッションはすぐに閉じる（scope: "local" はそのセッションだけを閉じる）。
 */
async function isCurrentPassword(email: string, password: string): Promise<boolean> {
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) return false;
  await client.auth.signOut({ scope: "local" });
  return true;
}

export async function changePassword(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const staff = await getStaffForAction();
  if (!staff) return RELOGIN;

  const current = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password.length < MIN_PASSWORD) {
    return { message: `新しいパスワードは${MIN_PASSWORD}文字以上にしてください。` };
  }
  if (password !== confirm) return { message: "確認用のパスワードが一致しません。" };

  if (!(await isRecoveryLogin())) {
    // 画面を開いたときはリンクから入ってすぐだったが、そのあと時間が切れた。
    // 今のパスワードの欄が無い（招待された人はそもそもパスワードが無い）ので、やり直してもらう
    if (formData.get("recovery") === "1") {
      return {
        message:
          "メールのリンクを開いてから時間が経ったため、このままでは変更できません。ログアウトして、ログイン画面の「パスワードを忘れた方」から設定し直してください。",
      };
    }
    if (!current) return { message: "今のパスワードを入力してください。" };
    if (!(await isCurrentPassword(staff.email, current))) {
      return { message: "今のパスワードが正しくありません。" };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return { message: "今と同じパスワードには変更できません。" };
    if (error.code === "weak_password") {
      return { message: "パスワードが単純すぎます。英字の大文字・小文字・数字・記号を混ぜてください。" };
    }
    if (error.code === "reauthentication_needed") {
      return { message: "ログインしてから時間が経っています。いったんログアウトし、ログインし直してから変更してください。" };
    }
    return { message: "変更できませんでした。時間をおいて、もう一度お試しください。" };
  }

  // ほかの端末に残っているログインは終わらせる（パスワードが漏れて変えた場合に備えて）
  await supabase.auth.signOut({ scope: "others" });

  return { done: "パスワードを変更しました。ほかの端末でのログインは終了しました。" };
}

export async function changeEmail(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const staff = await getStaffForAction();
  if (!staff) return RELOGIN;

  const email = String(formData.get("email") ?? "").trim();
  const current = String(formData.get("currentPassword") ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: "メールアドレスの形式が正しくありません。" };
  if (email.toLowerCase() === staff.email.toLowerCase()) return { message: "今と同じメールアドレスです。" };
  if (!current) return { message: "今のパスワードを入力してください。" };
  if (!(await isCurrentPassword(staff.email, current))) {
    return { message: "今のパスワードが正しくありません。" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: await authCallbackUrl("email") },
  );
  if (error) {
    if (error.code === "email_exists") return { message: "このメールアドレスは、すでにほかのアカウントで使われています。" };
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return { message: "送信が続いたため、いったん止めています。しばらく時間をおいてから、もう一度お試しください。" };
    }
    return { message: "変更できませんでした。時間をおいて、もう一度お試しください。" };
  }

  return {
    done: `${email} に確認メールを送りました。メール内のリンクを開くと変更が完了します（それまでは今のメールアドレスでログインします）。`,
  };
}
