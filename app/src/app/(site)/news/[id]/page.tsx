import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { NEWS_CATEGORY_LABEL } from "@/lib/constants/site";
import { getNews } from "@/lib/db/news";
import { formatDate } from "@/lib/utils/date";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const news = await getNews(id);
  if (!news) return { title: "お知らせ" };

  return {
    title: news.title,
    // 本文の冒頭を説明文に流用する（改行は詰める）
    description: news.body.replace(/\s+/g, " ").slice(0, 120),
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const news = await getNews(id);

  // 非公開・公開日時前のものは詳細でも見せない
  if (!news || !news.isPublished || news.publishedAt > new Date().toISOString()) {
    notFound();
  }

  return (
    <article className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-gold-600"
        >
          <ArrowLeft size={16} />
          お知らせ一覧
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <time className="font-display text-sm text-muted" dateTime={news.publishedAt}>
            {formatDate(news.publishedAt)}
          </time>
          <span className="rounded-full border border-gold-300 bg-gold-50 px-3 py-0.5 text-xs text-gold-700">
            {NEWS_CATEGORY_LABEL[news.category]}
          </span>
        </div>

        <h1 className="mt-4 text-2xl leading-relaxed text-navy-800 sm:text-3xl">{news.title}</h1>
        <span className="mt-6 block h-0.5 w-12 bg-gold-500" />

        {/* 本文は管理画面のテキストエリア入力なので、段落を改行で組み立てる */}
        <div className="mt-10 space-y-5">
          {news.body.split("\n").map((line, i) =>
            line.trim() === "" ? null : (
              <p key={i} className="text-sm leading-loose text-navy-700 sm:text-base">
                {line}
              </p>
            ),
          )}
        </div>
      </div>
    </article>
  );
}
