import "server-only";

import type { StaffRole } from "@/lib/staff-roles";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type StaffMember = {
  userId: string;
  name: string;
  role: StaffRole;
  // メールアドレス・ログイン状況は service_role キーがあるときだけ分かる
  email: string | null;
  // 招待したが、まだ一度もリンクを開いていない
  invitePending: boolean;
};

/*
 * スタッフの一覧（管理者だけが全員分を読める。RLS の staff_select_admin）。
 *
 * メールアドレスは Supabase のアカウント側（auth.users）にしか無いので、
 * service_role キーで取り寄せて合わせる。キーが無ければ名前とロールだけ返す。
 */
export async function listStaffMembers(): Promise<{ members: StaffMember[]; hasServiceKey: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .select("user_id, name, role")
    .order("created_at", { ascending: true });
  if (error) console.error("[db/staff] 一覧の取得に失敗", error);

  const service = createServiceClient();
  const accounts = new Map<string, { email: string | null; pending: boolean }>();
  if (service) {
    // スタッフは数人なので1ページで足りる
    const { data: list, error: listError } = await service.auth.admin.listUsers({ perPage: 1000 });
    if (listError) console.error("[db/staff] アカウント一覧の取得に失敗", listError);
    for (const u of list?.users ?? []) {
      accounts.set(u.id, { email: u.email ?? null, pending: !u.last_sign_in_at });
    }
  }

  const members = (data ?? []).map((row) => ({
    userId: row.user_id as string,
    name: row.name as string,
    role: (row.role === "admin" ? "admin" : "editor") as StaffRole,
    email: accounts.get(row.user_id)?.email ?? null,
    invitePending: accounts.get(row.user_id)?.pending ?? false,
  }));

  return { members, hasServiceKey: service !== null };
}
