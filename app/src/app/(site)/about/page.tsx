import type { Metadata } from "next";
import { Compass, HeartHandshake, Sparkles } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { PageHero } from "@/components/ui/page-hero";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { SectionHeading } from "@/components/ui/section-heading";
import { SwimStandards } from "@/components/ui/swim-standards";
import { SITE } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "アカデミーについて",
  description:
    "ペンタスロンアカデミーの理念、指導方針、対象年齢、練習環境についてご紹介します。",
};

// ⚠️ 仮テキスト。正式な理念・実績が決まり次第この配列を差し替える。
const POLICIES = [
  {
    icon: Compass,
    title: "5種目の総合力で見る",
    body: "近代五種は総合力の競技です。得意種目で稼ぐだけでは上位に届きません。いまどの種目がどれだけ足りないのかを数字で把握し、優先順位をつけて埋めていきます。",
  },
  {
    icon: Sparkles,
    title: "これまでの競技を、武器に変える",
    body: "水泳や陸上など積み上げてきたものは、近代五種でそのまま強みになります。土台のある種目を軸に、足りない種目を後から重ねて仕上げていきます。",
  },
  {
    icon: HeartHandshake,
    title: "競技よりも先に、姿勢を",
    body: "剣やレーザーピストルの扱い、譲り合って使う施設、対戦相手への礼。近代五種は道具と人に囲まれて成り立つ競技です。上を目指すほど、その土台がものを言います。",
  },
];

// ⚠️ 練習日・クラス・料金は仮テキスト。
// 対象と練習形態はヒアリング済み（子ども限定ではなく、個別・グループとも要相談）。
const FACTS = [
  { label: "対象", value: "中学生・高校生 〜 社会人の方が中心です（ほかの年代の方もご相談ください）" },
  { label: "練習形態", value: "個別 / グループ（ご希望に合わせてご相談ください）" },
  { label: "練習日", value: "週3〜4日（クラスにより異なります）" },
  { label: "クラス", value: "初級クラス / 選手クラス" },
  { label: "入会金・月謝", value: "お問い合わせください" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero title="アカデミーについて" titleEn="ABOUT" />

      {/* ── 理念 ───────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="MISSION"
              title="練習できる場所が、なかった。"
              description="ペンタスロンアカデミーは、近代五種に本気で取り組める環境がないという課題から立ち上げたスクールです。"
            />
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              近代五種は5つの種目それぞれに場所と道具を必要とする競技です。そのため「やってみたい」と思っても、5種目をまとめて鍛えられる場所がなかなか見つかりません。志があっても環境がないために届かない——その状況を変えることが、このアカデミーの出発点です。
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              目標は、日本代表として、そしてオリンピックの舞台で戦える選手を育てること。そのために必要な練習量と環境を整え、5種目すべてを勝てる水準まで引き上げていきます。
            </p>
          </div>
          <PhotoSlot label="アカデミー全体の集合写真などが入ります" />
        </div>
      </section>

      {/* ── 指導方針 ───────────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading eyebrow="POLICY" title="指導方針" align="center" />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {POLICIES.map((p) => {
              const Icon = p.icon;
              return (
                <li
                  key={p.title}
                  className="rounded-card border border-border bg-white p-7 text-center"
                >
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy-800">
                    <Icon size={26} className="text-gold-400" />
                  </span>
                  <h3 className="mt-5 text-lg text-navy-800">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── 概要 ───────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading eyebrow="OVERVIEW" title="アカデミー概要" />
          <dl className="mt-10 divide-y divide-border border-y border-border">
            {[
              { label: "名称", value: SITE.name },
              ...FACTS,
              { label: "所在地", value: SITE.address },
              { label: "連絡先", value: `${SITE.tel} / ${SITE.email}` },
            ].map((row) => (
              <div key={row.label} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="font-display text-sm font-bold text-navy-800">{row.label}</dt>
                <dd className="text-sm text-muted">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 強化選手チャレンジ基準 ─────────────────────────────────── */}
      <section id="standards" className="scroll-mt-20 bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="STANDARDS"
            title="強化選手チャレンジ基準"
            description="近代五種は水泳が土台になります。これまで泳いできた方に向けて、ひとつの目安として記録を示しています。入会の条件ではありませんので、届いていなくても構いません。"
          />
          <div className="mt-10">
            <SwimStandards />
          </div>
          <p className="mt-10 rounded-card border border-border bg-white px-5 py-4 text-sm leading-relaxed text-navy-700 sm:px-6">
            水泳で積み上げてきた力は、近代五種でそのまま武器になります。基準に近い記録をお持ちの方はもちろん、これから伸ばしていきたい方もご相談ください。
          </p>
        </div>
      </section>

      {/* ── 指導者 ─────────────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="COACH"
            title="指導者紹介"
            description="※ 指導者のプロフィールは準備中です。写真と経歴が揃い次第、こちらに掲載します。"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-card border border-border bg-white p-6">
                <PhotoSlot label="指導者の写真" ratio="aspect-square" className="!bg-navy-50" />
                <p className="mt-5 font-display text-base font-bold text-navy-800">
                  コーチ名が入ります
                </p>
                <p className="mt-1.5 text-xs text-muted">担当種目 / 保有資格などが入ります</p>
              </div>
            ))}
          </div>
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
