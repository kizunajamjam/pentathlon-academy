import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PreviewStatus } from "@/components/admin/preview-status";
import { NewsArticle } from "@/components/ui/news-article";
import { getNews } from "@/lib/db/news";

export const metadata: Metadata = { title: "お知らせのプレビュー" };

// お知らせのプレビュー。公開ページ（/news/[id]）と同じ NewsArticle で描く。
export default async function NewsPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const news = await getNews(id);
  if (!news) notFound();

  return (
    <>
      <PreviewStatus isPublished={news.isPublished} publishAt={news.publishedAt} />
      <NewsArticle news={news} />
    </>
  );
}
