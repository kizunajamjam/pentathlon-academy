import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { EventForm } from "@/components/admin/event-form";
import { SubmitButton } from "@/components/admin/form-ui";
import { getEvent } from "@/lib/db/events";
import { toDatetimeLocal } from "@/lib/utils/date";
import { removeEvent } from "../actions";

export default async function AdminEventEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <>
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-gold-600"
      >
        <ArrowLeft size={16} />
        大会・イベント一覧
      </Link>

      <h1 className="mt-5 text-xl text-navy-800">大会・イベントを編集</h1>

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
        <form action={removeEvent} className="mt-4">
          <input type="hidden" name="id" value={event.id} />
          <SubmitButton variant="danger" pendingLabel="削除中...">
            削除する
          </SubmitButton>
        </form>
      </div>
    </>
  );
}
