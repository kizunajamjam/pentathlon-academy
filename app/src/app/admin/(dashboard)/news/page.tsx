import Link from "next/link";
import { Plus } from "lucide-react";

import { NEWS_CATEGORY_LABEL } from "@/lib/constants/site";
import { listAllNews } from "@/lib/db/news";
import { formatDateDot, formatTime } from "@/lib/utils/date";

export default async function AdminNewsPage() {
  const news = await listAllNews();
  const now = new Date().toISOString();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl text-navy-800">お知らせ</h1>
        <Link
          href="/admin/news/new"
          className="flex items-center gap-1.5 rounded-full bg-navy-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-700"
        >
          <Plus size={16} />
          新規作成
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-border bg-white">
        {news.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-muted">
            まだお知らせがありません。「新規作成」から追加してください。
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {news.map((n) => {
              // 公開ONでも公開日時が未来なら、まだサイトには出ていない
              const scheduled = n.isPublished && n.publishedAt > now;

              return (
                <li key={n.id}>
                  <Link
                    href={`/admin/news/${n.id}`}
                    className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-navy-50/60 sm:flex-row sm:items-center sm:gap-5"
                  >
                    <span className="shrink-0 font-display text-xs text-muted sm:w-32">
                      {formatDateDot(n.publishedAt)} {formatTime(n.publishedAt)}
                    </span>
                    <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xs text-navy-600 sm:w-20 sm:text-center">
                      {NEWS_CATEGORY_LABEL[n.category]}
                    </span>
                    <span className="flex-1 text-sm text-navy-800">{n.title}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs sm:w-20 sm:text-center ${
                        !n.isPublished
                          ? "bg-navy-100 text-navy-600"
                          : scheduled
                            ? "bg-gold-100 text-gold-700"
                            : "bg-success-50 text-success-500"
                      }`}
                    >
                      {!n.isPublished ? "下書き" : scheduled ? "予約" : "公開中"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
