import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EventForm } from "@/components/admin/event-form";
import { toDatetimeLocal } from "@/lib/utils/date";

export default function AdminEventNewPage() {
  return (
    <>
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-gold-600"
      >
        <ArrowLeft size={16} />
        大会・イベント一覧
      </Link>

      <h1 className="mt-5 text-xl text-navy-800">大会・イベントを新規作成</h1>

      <div className="mt-8 rounded-card border border-border bg-white p-6 sm:p-8">
        <EventForm
          defaultStartsAt={toDatetimeLocal(new Date().toISOString())}
          defaultEndsAt=""
        />
      </div>
    </>
  );
}
