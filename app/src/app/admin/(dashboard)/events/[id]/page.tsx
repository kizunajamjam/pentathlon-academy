import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { EventForm } from "@/components/admin/event-form";
import { DeleteForm } from "@/components/admin/form-ui";
import { PreviewLink } from "@/components/admin/preview-link";
import { requireStaff } from "@/lib/auth-guard";
import { getEvent } from "@/lib/db/events";
import { toDatetimeLocal } from "@/lib/utils/date";
import { removeEvent } from "../actions";

export default async function AdminEventEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 画面遷移ではレイアウトの確認が動かないため、ページでも確かめる
  await requireStaff();
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <>
      <Link
        href="/admin/events"
        className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-muted transition-colors hover:text-gold-600"
      >
        <ArrowLeft size={16} />
        大会・イベント一覧
      </Link>

      <div className="mt-5 flex items-center justify-between gap-4">
        <h1 className="text-xl text-navy-800">大会・イベントを編集</h1>
        <PreviewLink href={`/admin/preview/events/${event.id}`} />
      </div>
      <p className="mt-2 text-xs text-muted">
        プレビューには保存済みの内容が出ます。編集したら、保存してから開いてください。
      </p>

      <div className="mt-8 rounded-card border border-border bg-white p-6 sm:p-8">
        <EventForm
          event={event}
          defaultStartsAt={toDatetimeLocal(event.startsAt)}
          defaultEndsAt={event.endsAt ? toDatetimeLocal(event.endsAt) : ""}
        />
      </div>

      <div className="mt-8 rounded-card border border-shoot-500/25 bg-white p-6">
        <p className="text-sm font-bold text-navy-800">この予定を削除</p>
        <p className="mt-1.5 text-xs text-muted">削除すると元に戻せません。</p>
        <DeleteForm
          action={removeEvent}
          id={event.id}
          confirmMessage="この予定を削除します。元に戻せません。よろしいですか？"
        />
      </div>
    </>
  );
}
