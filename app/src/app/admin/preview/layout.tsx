import Link from "next/link";
import { Eye } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { requireStaff } from "@/lib/auth-guard";

/*
 * 管理画面のプレビュー。下書きや予約中の内容を、公開ページと同じ見た目で確かめるためのもの。
 *
 * /admin の下に置いているので、スタッフしか開けない（ここで requireStaff）うえ、
 * next.config.ts の設定で検索エンジンにも載らず、ブラウザにも保存されない。
 * 公開ページと同じヘッダー・フッターで包み、上にプレビューであることを示す帯を出す。
 */
export const dynamic = "force-dynamic";

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  await requireStaff();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-gold-500 px-4 py-2 text-center text-xs font-bold text-navy-900">
        <span className="flex items-center gap-1.5">
          <Eye size={14} aria-hidden="true" />
          プレビュー表示です（管理画面にログインしている人にだけ見えています）
        </span>
        <Link href="/admin" className="underline underline-offset-4">
          管理画面に戻る
        </Link>
      </div>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
