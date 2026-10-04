import type { Metadata } from "next";
import Link from "next/link";

import { DisciplineIcon } from "@/components/icons/discipline-icons";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { ATHLETES, DISCIPLINES } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "強化選手",
  description:
    "ペンタスロンアカデミーの強化選手規定を満たした、強化選手をご紹介します。",
};

export default function AthletesPage() {
  return (
    <>
      <PageHero title="強化選手" titleEn="ATHLETES" />

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading
            eyebrow="DESIGNATED ATHLETES"
            title="強化選手"
            description="各種目の強化選手規定を満たした選手です。指定は種目ごとに、S・A・Bのランクで示しています。"
          />

          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {ATHLETES.map((a) => {
              const d = DISCIPLINES.find((x) => x.id === a.discipline);
              return (
                <li
                  key={a.name}
                  className="min-w-0 rounded-card border border-border bg-white p-6"
                >
                  <div className="flex items-center gap-3">
                    <DisciplineIcon
                      id={a.discipline}
                      className="h-12 w-12 shrink-0 object-contain"
                    />
                    <span className="inline-flex rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-white">
                      {a.designation}
                    </span>
                  </div>
                  <p className="mt-4 font-display text-xl font-bold text-navy-800">{a.name}</p>
                  {d && <p className="mt-1 text-xs text-muted">{d.name}</p>}
                  <dl className="mt-4 divide-y divide-border border-y border-border">
                    {a.records.map((r) => (
                      <div key={r.event} className="flex items-baseline justify-between gap-4 py-3">
                        <dt className="text-sm text-muted">{r.event}</dt>
                        <dd className="font-display font-bold tabular-nums text-navy-800">
                          {r.time}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>

          <p className="mt-10 text-sm text-muted">
            指定の基準は{" "}
            <Link
              href="/about#standards"
              className="font-bold text-navy-800 underline decoration-gold-400 underline-offset-4 transition-colors hover:text-gold-600"
            >
              強化選手規定
            </Link>{" "}
            をご覧ください。
          </p>
        </div>
      </section>

      <section className="bg-navy-800 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <SectionHeading
            eyebrow="CONTACT"
            title="まずは一度、お話しませんか。"
            tone="light"
            align="center"
          />
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact">お問い合わせ</ButtonLink>
            <ButtonLink href="/disciplines" variant="ghost">
              競技について知る
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
