import type { Metadata } from "next";

import { NewsRow } from "@/components/ui/news-row";
import { PageHero } from "@/components/ui/page-hero";
import { listPublishedNews } from "@/lib/db/news";

export const metadata: Metadata = {
  title: "お知らせ",
  description: "ペンタスロンアカデミーからのお知らせ・活動報告の一覧です。",
};

// お知らせの一覧。トップには最新4件しか出ないので、それより前のものはここから辿る。
export default async function NewsListPage() {
  const news = await listPublishedNews();

  return (
    <>
      <PageHero title="お知らせ" titleEn="NEWS" />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          {news.length > 0 ? (
            news.map((n) => <NewsRow key={n.id} news={n} />)
          ) : (
            <p className="py-8 text-sm text-muted">お知らせはまだありません。</p>
          )}
        </div>
      </section>
    </>
  );
}
