import type { Metadata } from "next";

import { NewsRow } from "@/components/ui/news-row";
import { PageHero } from "@/components/ui/page-hero";
import { listPublishedNews } from "@/lib/db/news";

export const metadata: Metadata = {
  title: "お知らせ",
  description: "ペンタスロンアカデミーからのお知らせ、活動報告、メディア掲載情報です。",
};

export default async function NewsPage() {
  const news = await listPublishedNews();

  return (
    <>
      <PageHero title="お知らせ" titleEn="NEWS" />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          {news.length > 0 ? (
            <div className="border-t border-border">
              {news.map((n) => (
                <NewsRow key={n.id} news={n} />
              ))}
            </div>
          ) : (
            <p className="rounded-card border border-border bg-surface px-6 py-12 text-center text-sm text-muted">
              お知らせはまだありません。
            </p>
          )}
        </div>
      </section>
    </>
  );
}
