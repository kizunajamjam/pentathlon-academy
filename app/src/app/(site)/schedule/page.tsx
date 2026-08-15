import type { Metadata } from "next";
import { Info, MapPin } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { DAY_LABEL, DISCIPLINES } from "@/lib/constants/site";
import { groupByDay, listActiveSlots } from "@/lib/db/schedule";
import type { DayOfWeek } from "@/types";

export const metadata: Metadata = {
  title: "練習スケジュール",
  description: "ペンタスロンアカデミーの週間練習スケジュールと練習場所のご案内です。",
};

// 月曜はじまりで並べる（日本の週間表記に合わせる）
const DAY_ORDER: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

export default async function SchedulePage() {
  const slots = await listActiveSlots();
  const byDay = groupByDay(slots);

  return (
    <>
      <PageHero title="練習スケジュール" titleEn="SCHEDULE" />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <SectionHeading
            eyebrow="WEEKLY"
            title="週間スケジュール"
            description="通常週のグループ練習の予定です。大会・合宿などにより変更になる場合があります。変更が生じた際はお知らせページでご案内します。"
          />

          {/* 週間表だけだとグループ練習しかないように見えるため、ここで補う */}
          <div className="mt-8 rounded-card border border-gold-200 bg-gold-50 px-5 py-5 sm:px-7">
            <h3 className="text-base text-navy-800">個別練習にも対応しています</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-navy-700">
              グループ練習だけでなく、個別での練習も受け付けています。目標や経験、通える頻度に合わせて組み立てますので、ご希望をお聞かせください。
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {DAY_ORDER.map((day) => {
              const daySlots = byDay.get(day);
              if (!daySlots || daySlots.length === 0) return null;

              const isWeekend = day === 0 || day === 6;

              return (
                <div
                  key={day}
                  className="overflow-hidden rounded-card border border-border bg-white"
                >
                  <div className="flex items-center gap-3 border-b border-border bg-navy-800 px-5 py-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-bold ${
                        isWeekend ? "bg-gold-500 text-navy-900" : "bg-white text-navy-800"
                      }`}
                    >
                      {DAY_LABEL[day]}
                    </span>
                    <span className="font-display text-sm text-navy-100">{DAY_LABEL[day]}曜日</span>
                  </div>

                  <ul className="divide-y divide-border">
                    {daySlots.map((slot) => {
                      const discipline = DISCIPLINES.find((d) => d.id === slot.discipline);

                      return (
                        <li
                          key={slot.id}
                          className="grid gap-2 px-5 py-4 sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-5"
                        >
                          <time className="font-display text-sm font-bold text-navy-800">
                            {slot.startTime} 〜 {slot.endTime}
                          </time>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <span className="rounded-full bg-navy-50 px-3 py-1 text-xs text-navy-700">
                              {slot.className}
                            </span>

                            {discipline && (
                              // この行では 16px 程度しか取れず、切り出しアイコンだと
                              // シルエットが潰れるので色の丸で示す。
                              <span className={`flex items-center gap-2 text-sm ${discipline.text}`}>
                                <span className={`h-2.5 w-2.5 rounded-full ${discipline.chip}`} />
                                {discipline.name}
                              </span>
                            )}

                            {slot.location && (
                              <span className="flex items-center gap-1.5 text-sm text-muted">
                                <MapPin size={14} className="shrink-0 text-gold-600" />
                                {slot.location}
                              </span>
                            )}

                            {slot.note && (
                              <span className="flex items-center gap-1.5 text-xs text-muted">
                                <Info size={13} className="shrink-0" />
                                {slot.note}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {slots.length === 0 && (
              <p className="py-10 text-center text-sm text-muted">
                スケジュールは準備中です。
              </p>
            )}
          </div>

          <p className="mt-8 rounded-card border border-gold-200 bg-gold-50 px-5 py-4 text-sm leading-relaxed text-navy-700">
            ※ 天候・施設の都合により中止や場所の変更が生じる場合があります。当日の実施可否は各クラスのご連絡をご確認ください。
          </p>
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <SectionHeading
            eyebrow="TRIAL"
            title="体験は、随時受け付けています。"
            description="ご希望の曜日・クラスと、個別・グループのご希望をお知らせください。空き状況をご案内します。"
            align="center"
          />
          <div className="mt-9 flex justify-center">
            <ButtonLink href="/contact">体験のお申し込み</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
