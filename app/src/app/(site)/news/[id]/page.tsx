import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsArticle } from "@/components/ui/news-article";
import { getNews, isNewsVisible, listPublishedNews } from "@/lib/db/news";

type Props = { params: Promise<{ id: string }> };

/*
 * 静的書き出し（GitHub Pages）では、生成する詳細ページの一覧が必要になる。
 * 通常のビルドでは事前生成せず、すべてリクエスト時に生成する。
 *
 * お知らせが1件も無いときでも、空の配列は返せない。Next.js は
 * generateStaticParams が最低1件返すことを求めており、空だと
 * 静的書き出しがビルドごと失敗する（empty-generate-static-params）。
 * どこからもリンクしない id をひとつ返して逃がす。開いても 404 に
 * なるだけで、一覧にも sitemap にも出ない。
 */
const NO_NEWS_ID = "none";

export async function generateStaticParams() {
  // 本番（Netlify）では事前生成しない。ビルド時には cookie を読めず、
  // Supabase の取得が失敗してビルドごと止まるため。詳細ページはアクセス時に作られる。
  if (process.env.STATIC_EXPORT !== "1") return [];

  const news = await listPublishedNews();
  return news.length > 0 ? news.map((n) => ({ id: n.id })) : [{ id: NO_NEWS_ID }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const news = await getNews(id);
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
  const news = await getNews(id);

  // 非公開・公開日時前のものは詳細でも見せない
  if (!news || !isNewsVisible(news)) {
    notFound();
  }

  return <NewsArticle news={news} />;
}
