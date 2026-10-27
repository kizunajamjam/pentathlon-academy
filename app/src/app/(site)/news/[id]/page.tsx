import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsArticle } from "@/components/ui/news-article";
import { getPublishedNews, isNewsVisible } from "@/lib/db/news";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const news = await getPublishedNews(id);
  // 非公開・公開前のものも、本文のページと同じく「見つからない」として扱う
  if (!news || !isNewsVisible(news)) {
    return { title: "ページが見つかりません" };
  }

  return {
    title: news.title,
    // 本文の冒頭を説明文に流用する（改行は詰める）
    description: news.body.replace(/\s+/g, " ").slice(0, 120),
    ...(news.imageUrl ? { openGraph: { images: [{ url: news.imageUrl }] } } : {}),
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const news = await getPublishedNews(id);

  // 非公開・公開日時前のものは詳細でも見せない
  if (!news || !isNewsVisible(news)) {
    notFound();
  }

  return <NewsArticle news={news} />;
}
