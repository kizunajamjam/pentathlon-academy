import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PreviewStatus } from "@/components/admin/preview-status";
import { EventCard } from "@/components/ui/event-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireStaff } from "@/lib/auth-guard";
import { getEvent, isEventPast } from "@/lib/db/events";

export const metadata: Metadata = { title: "大会・イベントのプレビュー" };

// 大会・イベントのプレビュー。「大会・イベント」ページ（/events）と同じカードで描く。
export default async function EventPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  // 画面遷移ではレイアウトの確認が動かないため、ページでも確かめる
  await requireStaff();
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  // 公開ページと同じく、最終日が今日（日本時間）より前なら「過去の大会」に出る
  const past = isEventPast(event);

  return (
    <>
      <PreviewStatus isPublished={event.isPublished} />
      <section className={`${past ? "bg-surface" : "bg-white"} py-16 sm:py-20`}>
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow={past ? "PAST EVENTS" : "UPCOMING"}
            title={past ? "過去の大会" : "開催予定"}
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <EventCard event={event} past={past} />
          </div>
        </div>
      </section>
    </>
  );
}
