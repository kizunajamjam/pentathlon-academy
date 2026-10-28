import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NEWS_CATEGORY_LABEL } from "@/lib/constants/site";
import { formatDate } from "@/lib/utils/date";
import type { News } from "@/types";

// お知らせの詳細（本文）。公開ページと、管理画面のプレビューで同じものを使う。
export function NewsArticle({ news }: { news: News }) {
  return (
    <article className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-gold-600"
        >
          <ArrowLeft size={16} />
          お知らせ一覧へ戻る
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

        {news.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- Storage の公開URLをそのまま表示する
          <img
            src={news.imageUrl}
            alt=""
            className="mt-10 w-full rounded-card border border-border object-cover"
          />
        )}

        {/*
          本文は管理画面のテキストエリア入力。空行で段落を分け、1回の改行は段落の中の改行にする
          （順位と記録のように、続けて読ませたい行を間を空けずに並べられるようにするため）
        */}
        <div className="mt-10 space-y-5">
          {news.body
            .replace(/\r\n/g, "\n")
            .split(/\n\s*\n/)
            .map((para) => para.trim())
            .filter((para) => para !== "")
            .map((para, i) => (
              <p key={i} className="whitespace-pre-line text-sm leading-loose text-navy-700 sm:text-base">
                {para}
              </p>
            ))}
        </div>
      </div>
    </article>
  );
}
