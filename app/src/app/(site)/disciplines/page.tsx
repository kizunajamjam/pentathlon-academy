import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { DisciplineIcon } from "@/components/icons/discipline-icons";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHero } from "@/components/ui/page-hero";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { SectionHeading } from "@/components/ui/section-heading";
import { DISCIPLINES } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "近代五種競技 / トレーニング内容",
  description:
    "フェンシング・水泳・障害物レース・射撃・ランニングの5種目と、アカデミーでの各種目のトレーニング内容をご紹介します。",
};

export default function DisciplinesPage() {
  return (
    <>
      <PageHero title="近代五種競技 / トレーニング内容" titleEn="DISCIPLINES" />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading
            eyebrow="WHAT IS MODERN PENTATHLON"
            title="1日で5つの競技を戦う。"
            description="近代五種は、フェンシング・水泳・障害物レース・レーザーラン（射撃＋ランニング）を1人の選手がすべて行い、各種目の成績を得点化して総合順位を決める競技です。単一種目の速さや強さではなく、性質の違う課題にどれだけ幅広く対応できるかが問われます。長らく行われてきた馬術は、2028年のロサンゼルス五輪から障害物レースに置き換わりました。"
          />
        </div>
      </section>

      {/* 種目ごとの詳細。左右交互に配置して単調にならないようにする。 */}
      {DISCIPLINES.map((d, i) => {
        const reversed = i % 2 === 1;

        return (
          <section
            key={d.id}
            id={d.id}
            className={`scroll-mt-20 py-14 sm:py-20 ${i % 2 === 1 ? "bg-surface" : "bg-white"}`}
          >
            <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:items-center lg:gap-14">
              <div className={reversed ? "lg:order-2" : ""}>
                <div className="flex items-center gap-4">
                  <DisciplineIcon id={d.id} className="h-20 w-20 shrink-0 object-contain" />
                  <div>
                    <p className="eyebrow text-[10px] text-muted">
                      {String(i + 1).padStart(2, "0")} / {d.nameEn}
                    </p>
                    <h2 className="mt-1.5 text-2xl text-navy-800">{d.name}</h2>
                  </div>
                </div>

                <p className={`mt-6 font-display text-lg ${d.text}`}>{d.summary}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{d.detail}</p>

                {d.id === "swimming" && (
                  <p className="mt-4 text-sm">
                    <Link
                      href="/about#standards"
                      className="font-bold text-navy-800 underline decoration-gold-400 underline-offset-4 transition-colors hover:text-gold-600"
                    >
                      水泳経験者向けのチャレンジ基準を見る
                    </Link>
                  </p>
                )}

                <div className="mt-7">
                  <p className="eyebrow text-[10px] text-navy-800">TRAINING</p>
                  <ul className="mt-3 space-y-2">
                    {d.training.map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-sm text-navy-700">
                        <Check size={16} className={`mt-0.5 shrink-0 ${d.text}`} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <PhotoSlot
                label={`${d.name}の練習写真が入ります`}
                className={reversed ? "lg:order-1" : ""}
              />
            </div>
          </section>
        );
      })}

      <section className="bg-navy-800 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <SectionHeading
            eyebrow="CONTACT"
            title="5種目を、順に積み上げていく。"
            description="5種目すべての経験がなくても構いません。いまある強みを軸に、足りない種目を重ねていきます。まずは実際の練習を見てみてください。"
            tone="light"
            align="center"
          />
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact">体験のお申し込み</ButtonLink>
            <ButtonLink href="/schedule" variant="ghost">
              練習スケジュール
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
