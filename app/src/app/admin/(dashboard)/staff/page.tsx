import { requireAdmin } from "@/lib/auth-guard";
import { listStaffMembers } from "@/lib/db/staff";
import { ROLE_LABELS } from "@/lib/staff-roles";
import { InviteForm, RemoveForm, ResendInviteForm, RoleForm } from "./staff-forms";

// スタッフの管理（管理者だけ）。招待・ロールの変更・削除
export default async function AdminStaffPage() {
  const me = await requireAdmin();
  const { members, hasServiceKey } = await listStaffMembers();

  return (
    <>
      <h1 className="text-xl text-navy-800">スタッフ</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        管理画面に入れる人を管理します。<strong className="text-navy-800">管理者</strong>
        はすべての操作とスタッフの管理が、<strong className="text-navy-800">編集者</strong>
        はお知らせ・スケジュール・大会・指導者・選手・お問い合わせの操作ができます。
      </p>

      {!hasServiceKey && (
        <p className="mt-6 rounded-md border border-gold-300 bg-gold-50 px-4 py-3 text-sm leading-relaxed text-gold-800">
          招待・削除をするには、サーバーに <code>SUPABASE_SERVICE_ROLE_KEY</code> の設定が必要です（docs/SETUP.md）。
          ロールの変更は今のままでもできます。
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {members.map((m) => {
          const isMe = m.userId === me.userId;
          return (
            <li key={m.userId} className="rounded-card border border-border bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold text-navy-800">{m.name}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs ${
                    m.role === "admin" ? "bg-navy-800 text-white" : "bg-navy-100 text-navy-600"
                  }`}
                >
                  {ROLE_LABELS[m.role]}
                </span>
                {m.invitePending && (
                  <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs text-gold-800">招待中</span>
                )}
                {isMe && <span className="text-xs text-muted">（あなた）</span>}
              </div>
              {m.email && <p className="mt-1 break-all text-sm text-muted">{m.email}</p>}

              {!isMe && (
                <div className="mt-5 space-y-4 border-t border-border pt-5">
                  <RoleForm userId={m.userId} role={m.role} />
                  {hasServiceKey && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      {m.invitePending && <ResendInviteForm userId={m.userId} />}
                      <RemoveForm userId={m.userId} name={m.name} />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <section className="mt-10 rounded-card border border-border bg-white p-6 sm:p-8">
        <h2 className="text-base font-bold text-navy-800">スタッフを招待</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          招待メールのリンクを開くと、認証アプリの登録とパスワードの設定に進みます。リンクの有効期限は1時間です。
        </p>
        <div className="mt-6 max-w-md">
          <InviteForm disabled={!hasServiceKey} />
        </div>
      </section>
    </>
  );
}
