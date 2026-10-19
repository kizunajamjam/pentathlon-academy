// スタッフのロール（supabase/migrations/20261019_staff_roles.sql）。画面とサーバーの両方から使う
// admin: スタッフの招待・ロール変更・削除もできる。editor: 内容の編集だけ
export type StaffRole = "admin" | "editor";

export const ROLE_LABELS: Record<StaffRole, string> = { admin: "管理者", editor: "編集者" };
