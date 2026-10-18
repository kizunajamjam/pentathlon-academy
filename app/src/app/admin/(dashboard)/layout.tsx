import Link from "next/link";
import { ExternalLink, LogOut, UserCog } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { LogoMark } from "@/components/layout/site-logo";
import { requireStaff } from "@/lib/auth-guard";
import { signOut } from "@/app/admin/login/actions";

/*
 * 管理画面は必ずリクエストごとにレンダリングする。
 *
 * Supabase 未設定でビルドすると requireStaff が cookies() に触れないまま
 * 終わるため、Next が「静的ページ」と判断して認可結果ごと固定してしまう。
 * それを防ぐために明示的に動的レンダリングを指定している。
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // ここで一度だけ認可を通す。配下の各ページは staff 前提で書いてよい。
  const staff = await requireStaff();

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-sm font-bold text-navy-800">管理画面</span>
          </Link>

          <div className="flex items-center gap-1">
            <span className="mr-2 hidden text-xs text-muted sm:inline">{staff.name}</span>
            {/* スマホでは横幅が足りないのでアイコンだけにする */}
            <Link
              href="/admin/account"
              aria-label="アカウント設定"
              title="アカウント設定"
              className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs text-muted transition-colors hover:bg-navy-50 hover:text-gold-600"
            >
              <UserCog size={16} className="sm:size-3.5" />
              <span className="hidden sm:inline">アカウント</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex min-h-11 items-center gap-1.5 rounded-md px-2.5 text-xs text-muted transition-colors hover:bg-navy-50 hover:text-gold-600"
            >
              <ExternalLink size={14} />
              サイトを見る
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="flex min-h-11 items-center gap-1.5 rounded-md px-2.5 text-xs text-muted transition-colors hover:bg-navy-50 hover:text-shoot-500"
              >
                <LogOut size={14} />
                ログアウト
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-2">
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
