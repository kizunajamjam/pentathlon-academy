"use server";

import { redirect } from "next/navigation";

import { isStaffPendingMfa } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";

export type MfaState = { message?: string };
export type EnrollResult = { factorId: string; qrCode: string; secret: string } | { message: string };

const CODE = /^\d{6}$/;
const readCode = (formData: FormData) => String(formData.get("code") ?? "").replace(/\s/g, "");

// 認証アプリに出ている6桁のコードを確認する（登録済みの人の毎回のログイン）
export async function verifyMfa(_prev: MfaState, formData: FormData): Promise<MfaState> {
  if ((await isStaffPendingMfa()) === "none") redirect("/admin/login");

  const code = readCode(formData);
  if (!CODE.test(code)) return { message: "認証アプリに表示されている6桁の数字を入力してください。" };

  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp[0];
  if (!factor) return { message: "認証アプリが登録されていません。ページを読み込み直してください。" };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) return { message: "コードが正しくないか、有効期限が切れています。新しいコードで試してください。" };

  redirect("/admin");
}

/*
 * 認証アプリの登録を始める（初回だけ）。QR コードと、手入力用の文字列を返す。
 *
 * すでに登録済みの人は、ここからは追加できない（コードを確認したあとでないと増やせない）。
 * パスワードだけを知った人が、自分のスマホを勝手に登録するのを防ぐため。
 */
export async function startEnroll(): Promise<EnrollResult> {
  if ((await isStaffPendingMfa()) === "none") redirect("/admin/login");

  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors && factors.totp.length > 0) {
    return { message: "認証アプリはすでに登録されています。ページを読み込み直してください。" };
  }

  // 途中でやめた登録が残っていると新しく登録できないので、先に消す
  for (const f of factors?.all ?? []) {
    if (f.factor_type === "totp" && f.status === "unverified") {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "ペンタスロンアカデミー管理画面",
    issuer: "ペンタスロンアカデミー",
  });
  if (error || !data) return { message: "登録を始められませんでした。時間をおいて、もう一度お試しください。" };

  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

// 登録の仕上げ。認証アプリに出た最初のコードで確認する
export async function confirmEnroll(_prev: MfaState, formData: FormData): Promise<MfaState> {
  if ((await isStaffPendingMfa()) === "none") redirect("/admin/login");

  const factorId = String(formData.get("factorId") ?? "");
  const code = readCode(formData);
  if (!factorId) return { message: "もう一度「登録を始める」からやり直してください。" };
  if (!CODE.test(code)) return { message: "認証アプリに表示されている6桁の数字を入力してください。" };

  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { message: "コードが正しくないか、有効期限が切れています。新しいコードで試してください。" };

  redirect("/admin");
}
