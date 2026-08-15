import Link from "next/link";
import { Plus } from "lucide-react";

import { EVENT_CATEGORY_LABEL } from "@/lib/constants/site";
import { listAllEvents } from "@/lib/db/events";
import { formatDateDot, formatTime } from "@/lib/utils/date";

export default async function AdminEventsPage() {
  const events = await listAllEvents();
  const now = new Date().toISOString();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl text-navy-800">大会・イベント</h1>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-1.5 rounded-full bg-navy-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-700"
        >
          <Plus size={16} />
          新規作成
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-border bg-white">
        {events.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-muted">
            まだ予定がありません。「新規作成」から追加してください。
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/admin/events/${e.id}`}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-navy-50/60 sm:flex-row sm:items-center sm:gap-5"
                >
                  <span className="shrink-0 font-display text-xs text-muted sm:w-32">
                    {formatDateDot(e.startsAt)} {formatTime(e.startsAt)}
                  </span>
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xs text-navy-600 sm:w-16 sm:text-center">
                    {EVENT_CATEGORY_LABEL[e.category]}
                  </span>
                  <span className="flex-1 text-sm text-navy-800">{e.title}</span>
                  {e.startsAt < now && (
                    <span className="shrink-0 text-xs text-muted">終了</span>
                  )}
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs sm:w-20 sm:text-center ${
                      e.isPublished ? "bg-success-50 text-success-500" : "bg-navy-100 text-navy-600"
                    }`}
                  >
                    {e.isPublished ? "公開中" : "下書き"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
