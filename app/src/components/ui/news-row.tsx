import Link from "next/link";

import { NEWS_CATEGORY_LABEL } from "@/lib/constants/site";
import { formatDateDot } from "@/lib/utils/date";
import type { News } from "@/types";

// お知らせ1件分の行。トップページと一覧ページで共用する。
export function NewsRow({ news }: { news: News }) {
  return (
    <Link
      href={`/news/${news.id}`}
      className="group flex flex-col gap-1.5 border-b border-border py-5 transition-colors hover:bg-navy-50/60 sm:flex-row sm:items-center sm:gap-5"
    >
      <time className="shrink-0 font-display text-sm text-muted" dateTime={news.publishedAt}>
        {formatDateDot(news.publishedAt)}
      </time>
      <span className="shrink-0 rounded-full border border-gold-300 bg-gold-50 px-3 py-0.5 text-xs text-gold-700 sm:w-24 sm:text-center">
        {NEWS_CATEGORY_LABEL[news.category]}
      </span>
      <span className="text-sm text-navy-800 group-hover:text-gold-600 sm:text-base">
        {news.title}
      </span>
    </Link>
  );
}
