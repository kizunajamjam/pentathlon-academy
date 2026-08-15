import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button-link";
import { EventCard } from "@/components/ui/event-card";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { listPastEvents, listUpcomingEvents } from "@/lib/db/events";

export const metadata: Metadata = {
  title: "大会・イベント",
  description:
    "ペンタスロンアカデミーが参加・主催する大会、体験会、合宿、見学会の予定と過去の実施記録です。",
};

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([listUpcomingEvents(), listPastEvents(6)]);

  return (
    <>
      <PageHero title="大会・イベント" titleEn="EVENTS" />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="UPCOMING"
            title="開催予定"
            description="出場・参加できる大会の予定です。要項や申し込み方法は主催者のページをご確認ください。ご不明な点はアカデミーにお問い合わせいただければご案内します。"
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>

          {upcoming.length === 0 && (
            <p className="mt-10 rounded-card border border-border bg-surface px-6 py-10 text-center text-sm text-muted">
              現在、公開中の開催予定はありません。決まり次第こちらでお知らせします。
            </p>
          )}

          {/* 体験・見学は日程を組んで開催する形ではなく随時受付のため、
              予定一覧とは別枠で案内する */}
          <div className="mt-10 rounded-card border border-gold-200 bg-gold-50 px-6 py-7 sm:px-8">
            <h3 className="text-lg text-navy-800">体験・見学は随時受け付けています</h3>
            <p className="mt-3 text-sm leading-relaxed text-navy-700">
              日程を決めて開催する形ではなく、ご希望の日に合わせてご案内しています。
              練習スケジュールをご覧のうえ、ご都合のよい曜日・クラスをお知らせください。空き状況をお伝えします。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/contact">体験・見学を申し込む</ButtonLink>
              <ButtonLink href="/schedule" variant="outline">
                練習スケジュール
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {past.length > 0 && (
        <section className="bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionHeading eyebrow="ARCHIVE" title="これまでの実施" />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => (
                <EventCard key={e.id} event={e} past />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-navy-800 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <SectionHeading
            eyebrow="CONTACT"
            title="大会に出てみたい方へ"
            description="出場を考えている大会がある方、どの大会から挑戦すればよいか迷っている方は、お気軽にご相談ください。"
            tone="light"
            align="center"
          />
          <div className="mt-9 flex justify-center">
            <ButtonLink href="/contact">お問い合わせ</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
