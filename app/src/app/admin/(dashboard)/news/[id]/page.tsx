import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { NewsForm } from "@/components/admin/news-form";
import { SubmitButton } from "@/components/admin/form-ui";
import { PreviewLink } from "@/components/admin/preview-link";
import { getNews } from "@/lib/db/news";
import { toDatetimeLocal } from "@/lib/utils/date";
import { removeNews } from "../actions";

export default async function AdminNewsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNews(id);
  if (!news) notFound();

  return (
    <>
      <Link
        href="/admin/news"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-gold-600"
      >
        <ArrowLeft size={16} />
        お知らせ一覧
      </Link>

      <div className="mt-5 flex items-center justify-between gap-4">
        <h1 className="text-xl text-navy-800">お知らせを編集</h1>
        <PreviewLink href={`/admin/preview/news/${news.id}`} />
      </div>
      <p className="mt-2 text-xs text-muted">
        プレビューには保存済みの内容が出ます。編集したら、保存してから開いてください。
      </p>

      <div className="mt-8 rounded-card border border-border bg-white p-6 sm:p-8">
        <NewsForm news={news} defaultPublishedAt={toDatetimeLocal(news.publishedAt)} />
      </div>

      <div className="mt-8 rounded-card border border-shoot-500/25 bg-white p-6">
        <p className="text-sm font-bold text-navy-800">このお知らせを削除</p>
        <p className="mt-1.5 text-xs text-muted">
          削除すると元に戻せません。サイトからも表示されなくなります。
        </p>
        <form action={removeNews} className="mt-4">
          <input type="hidden" name="id" value={news.id} />
          <SubmitButton variant="danger" pendingLabel="削除中...">
            削除する
          </SubmitButton>
        </form>
      </div>
    </>
  );
}
