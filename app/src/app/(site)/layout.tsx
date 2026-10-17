import { SiteHeader } from "@/components/layout/site-header";
import { Analytics } from "@/components/layout/analytics";
import { SiteFooter } from "@/components/layout/site-footer";

/*
 * 公開ページは作ったものを使い回し、5分ごとに作り直す（毎回作り直すと表示が遅い）。
 * 管理画面で保存したときは各 Server Action の revalidatePath ですぐ作り直されるので、
 * 待たずに反映される。5分ごとの作り直しは、日付で表示が変わるもの（大会の「開催予定」が
 * 終わると「過去の大会」へ移る、予約投稿のお知らせが公開日時に出る）のため。
 */
export const revalidate = 300;

// 公開サイト側の共通レイアウト。管理画面(admin)はこれを通らない。
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <Analytics />
    </div>
  );
}
