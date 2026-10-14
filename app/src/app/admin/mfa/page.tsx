import { redirect } from "next/navigation";

import { LogoMark } from "@/components/layout/site-logo";
import { isStaffPendingMfa } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/admin/login/actions";
import { MfaForm } from "./mfa-form";

// ログイン状態によって中身が変わるので、毎回描画する
export const dynamic = "force-dynamic";

/*
 * 二段階認証の画面。パスワードでログインした直後に必ずここを通る。
 * - 認証アプリが登録済み → 6桁のコードを入力
 * - まだ（初回） → QR コードを読み取って登録
 */
export default async function AdminMfaPage() {
  const state = await isStaffPendingMfa();
  if (state === "none") redirect("/admin/login");
  if (state === "ok") redirect("/admin");

  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const enrolled = (factors?.totp.length ?? 0) > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-800 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-black p-1.5">
            <LogoMark size={56} className="h-full w-full object-contain" />
          </span>
          <h1 className="mt-5 font-display text-lg text-white">二段階認証</h1>
          <p className="mt-1.5 text-xs text-navy-300">ペンタスロンアカデミー 管理画面</p>
        </div>

        <MfaForm mode={enrolled ? "verify" : "setup"} />

        <form action={signOut} className="mt-6 text-center">
          <button type="submit" className="text-xs text-navy-300 underline underline-offset-4 hover:text-white">
            ログアウトしてやめる
          </button>
        </form>
      </div>
    </div>
  );
}
