import { KeyRound, Mail } from "lucide-react";

import { isRecoveryLogin, requireStaff } from "@/lib/auth-guard";
import { getCurrentUser } from "@/lib/supabase/server";
import { EmailForm, PasswordForm } from "./account-forms";

export default async function AdminAccountPage() {
  const staff = await requireStaff();
  const [user, recovery] = await Promise.all([getCurrentUser(), isRecoveryLogin()]);

  return (
    <>
      <h1 className="text-xl text-navy-800">アカウント設定</h1>
      <p className="mt-3 text-sm text-muted">ログインに使うメールアドレスとパスワードを変更できます。</p>

      <section className="mt-8 rounded-card border border-border bg-white p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-base font-bold text-navy-800">
          <KeyRound size={18} className="text-gold-600" aria-hidden="true" />
          {recovery ? "新しいパスワードを設定" : "パスワードの変更"}
        </h2>
        {recovery && (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            再設定のメールから入ったので、今のパスワードは入力しなくて大丈夫です。
          </p>
        )}
        <div className="mt-6 max-w-md">
          <PasswordForm recovery={recovery} />
        </div>
      </section>

      <section className="mt-6 rounded-card border border-border bg-white p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-base font-bold text-navy-800">
          <Mail size={18} className="text-gold-600" aria-hidden="true" />
          メールアドレスの変更
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          今のメールアドレス: <span className="font-bold text-navy-800">{staff.email}</span>
        </p>
        {user?.new_email && (
          <p className="mt-1 text-sm leading-relaxed text-muted">
            確認待ち: <span className="font-bold text-navy-800">{user.new_email}</span>
            （届いたメールのリンクを開くと変更が完了します）
          </p>
        )}
        <div className="mt-6 max-w-md">
          <EmailForm />
        </div>
      </section>
    </>
  );
}
