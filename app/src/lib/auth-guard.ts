import "server-only";

import { redirect } from "next/navigation";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type StaffContext = { userId: string; name: string; email: string };

// staff テーブルに登録されている user だけを通す。
// ログイン済みでも staff に無ければ管理画面には入れない。
async function findStaff(): Promise<StaffContext | null> {
  if (!isSupabaseConfigured) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("staff")
    .select("user_id, name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;
  return { userId: user.id, name: data.name, email: user.email ?? "" };
}

// ページ(Server Component)用: 権限がなければログイン画面へ送る。
export async function requireStaff(): Promise<StaffContext> {
  const staff = await findStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}

// Server Action 用: リダイレクトせず null を返すので、呼び出し側でエラー応答にする。
export async function getStaffForAction(): Promise<StaffContext | null> {
  return findStaff();
}
