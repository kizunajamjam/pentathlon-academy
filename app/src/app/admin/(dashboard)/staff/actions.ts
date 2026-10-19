"use server";

import { revalidatePath } from "next/cache";

import { getAdminForAction } from "@/lib/auth-guard";
import type { StaffRole } from "@/lib/staff-roles";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type StaffActionState = { message?: string; done?: string };

const NOT_ADMIN = { message: "この操作は管理者だけができます。ページを読み込み直してください。" };
const NO_SERVICE_KEY = {
  message: "招待・削除には SUPABASE_SERVICE_ROLE_KEY の設定が必要です（docs/SETUP.md）。",
};
// 管理者を0人にする変更は、データベースのトリガーが断る（staff_keep_one_admin）
const LAST_ADMIN = { message: "管理者を0人にはできません。先にほかの人を管理者にしてください。" };

const readRole = (formData: FormData): StaffRole | null => {
  const role = formData.get("role");
  return role === "admin" || role === "editor" ? role : null;
};

/*
 * スタッフを招待する。招待メールを送り、同時に staff に登録する
 * （本人がリンクを開いたときには、もう管理画面に入れる状態にしておく）。
 * 招待メールの文面は Supabase 側で差し替えておくこと（docs/SETUP.md）。
 */
export async function inviteStaff(_prev: StaffActionState, formData: FormData): Promise<StaffActionState> {
  if (!(await getAdminForAction())) return NOT_ADMIN;
  const service = createServiceClient();
  if (!service) return NO_SERVICE_KEY;

  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const role = readRole(formData);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: "メールアドレスの形式が正しくありません。" };
  if (!name) return { message: "名前を入力してください。" };
  if (!role) return { message: "ロールを選んでください。" };

  const { data, error } = await service.auth.admin.inviteUserByEmail(email);
  if (error || !data.user) {
    if (error?.code === "email_exists" || error?.status === 422) {
      return { message: "このメールアドレスは、すでにアカウントがあります。" };
    }
    if (error?.code === "over_email_send_rate_limit" || error?.status === 429) {
      return { message: "送信が続いたため、いったん止めています。しばらく時間をおいてから、もう一度お試しください。" };
    }
    console.error("[admin/staff] 招待に失敗", error);
    return { message: "招待メールを送れませんでした。時間をおいて、もう一度お試しください。" };
  }

  const { error: insertError } = await service.from("staff").insert({ user_id: data.user.id, name, role });
  if (insertError) {
    console.error("[admin/staff] staff への登録に失敗", insertError);
    // 管理画面に入れないアカウントだけが残らないよう、作ったアカウントを消しておく
    await service.auth.admin.deleteUser(data.user.id);
    return { message: "登録できませんでした。時間をおいて、もう一度お試しください。" };
  }

  revalidatePath("/admin/staff");
  return { done: `${email} に招待メールを送りました。リンクの有効期限は1時間です。` };
}

// 招待メールを送り直す（リンクの期限切れなど）。まだ一度もログインしていない人だけ
export async function resendInvite(_prev: StaffActionState, formData: FormData): Promise<StaffActionState> {
  if (!(await getAdminForAction())) return NOT_ADMIN;
  const service = createServiceClient();
  if (!service) return NO_SERVICE_KEY;

  const userId = String(formData.get("userId") ?? "");
  const { data } = await service.auth.admin.getUserById(userId);
  const email = data.user?.email;
  if (!email) return { message: "アカウントが見つかりません。ページを読み込み直してください。" };
  if (data.user?.last_sign_in_at) return { message: "この人はすでにログインしています。" };

  const { error } = await service.auth.admin.inviteUserByEmail(email);
  if (error) {
    console.error("[admin/staff] 招待の再送に失敗", error);
    return { message: "送れませんでした。時間をおいて、もう一度お試しください。" };
  }
  return { done: `${email} に招待メールを送り直しました。` };
}

/*
 * ロールを変える。書き込みはログイン中のセッションで行うので、
 * 画面の確認をすり抜けても、データベースの RLS（staff_update_admin）が管理者以外を弾く。
 */
export async function changeRole(_prev: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const admin = await getAdminForAction();
  if (!admin) return NOT_ADMIN;

  const userId = String(formData.get("userId") ?? "");
  const role = readRole(formData);
  if (!userId || !role) return { message: "ロールを選んでください。" };
  // 自分を編集者にすると、その場でこの画面に戻れなくなるので断る
  if (userId === admin.userId) return { message: "自分のロールは変えられません。ほかの管理者に頼んでください。" };

  const supabase = await createClient();
  const { error } = await supabase.from("staff").update({ role }).eq("user_id", userId);
  if (error) {
    if (error.code === "P0001") return LAST_ADMIN;
    console.error("[admin/staff] ロールの変更に失敗", error);
    return { message: "変更できませんでした。時間をおいて、もう一度お試しください。" };
  }

  revalidatePath("/admin/staff");
  return { done: "ロールを変更しました。" };
}

/*
 * スタッフを外す。アカウントごと消すので、同じメールアドレスでまた招待できる
 * （staff の行は auth.users から連鎖して消える）。
 */
export async function removeStaff(_prev: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const admin = await getAdminForAction();
  if (!admin) return NOT_ADMIN;
  const service = createServiceClient();
  if (!service) return NO_SERVICE_KEY;

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { message: "ページを読み込み直してください。" };
  if (userId === admin.userId) return { message: "自分は削除できません。ほかの管理者に頼んでください。" };

  // 対象がスタッフであることを、ログイン中のセッション（RLS）で確かめてから消す。
  // service_role は何でも消せるので、スタッフ以外のアカウントを消さないようにするため
  const supabase = await createClient();
  const { data: row } = await supabase.from("staff").select("user_id").eq("user_id", userId).maybeSingle();
  if (!row) return { message: "このスタッフは見つかりません。ページを読み込み直してください。" };

  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) {
    console.error("[admin/staff] 削除に失敗", error);
    return { message: "削除できませんでした。時間をおいて、もう一度お試しください。" };
  }

  revalidatePath("/admin/staff");
  return { done: "削除しました。" };
}
