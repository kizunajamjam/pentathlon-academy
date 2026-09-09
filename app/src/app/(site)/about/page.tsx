import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Compass,
  ExternalLink,
  HeartHandshake,
  Microscope,
  Sparkles,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { PageHero } from "@/components/ui/page-hero";
import { PendingSlot } from "@/components/ui/pending-slot";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { SectionHeading } from "@/components/ui/section-heading";
import { SwimStandards } from "@/components/ui/swim-standards";
import { COACHES, PARTNERS, QUALIFICATIONS, SITE } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "アカデミーについて",
  description:
    "ペンタスロンアカデミーの理念、指導者と保有資格、育成の考え方、連携先、今後の研究についてご紹介します。",
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

/*
 * アカデミー概要。
 *
 * 会費はクラブ規約 第5条・第6条がそのまま根拠になる（月会費は取らず、実費のみ）。
 * ⚠️ 練習日・クラスは仮テキスト。
 * 対象と練習形態はヒアリング済み（子ども限定ではなく、個別・グループとも要相談）。
 */
const FACTS = [
  { label: "対象", value: "中学生・高校生 〜 社会人の方が中心です（ほかの年代の方もご相談ください）" },
  { label: "練習形態", value: "個別 / グループ（ご希望に合わせてご相談ください）" },
  { label: "練習日", value: "週3〜4日（クラスにより異なります）" },
  { label: "クラス", value: "初級クラス / 選手クラス" },
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
              eyebrow="PHILOSOPHY"
              title="練習できる場所が、なかった。"
              description="ペンタスロンアカデミーは、近代五種に本気で取り組める環境がないという課題から立ち上げたスクールです。"
            />
            {/*
              ⚠️ 仮テキスト: いただいた構成案では「5つの競技を通じた総合的な○○」と
              ○○ が空欄だった。文として成立させるため「育成」で埋めてある。
              正式な語が決まったらこの1語を差し替える。
            */}
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              掲げているのは、5つの競技を通じた総合的な育成です。近代五種は5つの種目それぞれに場所と道具を必要とする競技です。そのため「やってみたい」と思っても、5種目をまとめて鍛えられる場所がなかなか見つかりません。志があっても環境がないために届かない——その状況を変えることが、このアカデミーの出発点です。
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

      {/* ── 指導者 ─────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="COACHING TEAM"
            title="指導者"
            description="※ 経歴と写真は準備中です。揃い次第こちらに掲載します。"
          />
          {/*
            列数は人数に合わせる。3列に2人だと右が空くため。
            Tailwind は文字列結合したクラス名を purge するので、完全な形で持つ。
          */}
          <div
            className={`mt-10 grid gap-6 sm:grid-cols-2 ${
              COACHES.length > 2 ? "lg:grid-cols-3" : "lg:max-w-3xl"
            }`}
          >
            {COACHES.map((coach) => (
              <div key={coach.name} className="rounded-card border border-border bg-white p-6">
                <PhotoSlot label="指導者の写真" ratio="aspect-square" className="!bg-navy-50" />
                <p className="mt-5 font-display text-base font-bold text-navy-800">{coach.name}</p>
                {coach.role.length > 0 ? (
                  <ul className="mt-1.5 space-y-0.5">
                    {coach.role.map((r) => (
                      <li key={r} className="text-xs leading-relaxed text-muted">
                        {r}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1.5 text-xs text-muted">担当種目・経歴は準備中です</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 保有資格 ───────────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          {/*
            ⚠️ いただいた原文は「各競技・スポーツ科学・コンディショニング領域の
            専門資格を保有しています」だったが、受け取った資格4件はいずれも
            競技の指導資格。スポーツ科学・コンディショニングの資格が届いたら
            原文の言い回しに戻す。
          */}
          <SectionHeading
            eyebrow="QUALIFICATIONS"
            title="保有資格"
            description="当アカデミーの指導者は、指導する各競技において公認の専門資格を保有しています。"
          />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {QUALIFICATIONS.map((q) => (
              <li
                key={q}
                className="flex items-start gap-3 rounded-card border border-border bg-white px-5 py-4"
              >
                <Award size={18} className="mt-0.5 shrink-0 text-gold-600" />
                <span className="text-sm leading-relaxed text-navy-800">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 育成・評価システム ─────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading
            eyebrow="ACADEMY METHOD"
            title="育成・評価のしくみ"
            description="5種目それぞれの現在地を測り、どこを伸ばすかを決めていくための、アカデミー独自の進め方です。"
          />
          <div className="mt-10">
            <PendingSlot label="育成・評価システムの内容は準備中です。" />
          </div>
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

      {/* ── 連携先 ─────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading
            eyebrow="PARTNERS"
            title="連携先"
            description="5種目を支える環境は、アカデミーだけで揃うものではありません。専門の施設・クラブと連携して練習環境をつくっています。"
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {PARTNERS.map((partner) => (
              <li
                key={partner.name}
                className="rounded-card border border-border bg-surface px-6 py-6"
              >
                <p className="font-display text-base font-bold text-navy-800">{partner.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{partner.summary}</p>
                {partner.url && (
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-navy-800 underline decoration-gold-400 underline-offset-4 transition-colors hover:text-gold-600"
                  >
                    ウェブサイト
                    <ExternalLink size={14} className="shrink-0" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 選手・大会実績 ─────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading
            eyebrow="ATHLETE / RESULTS"
            title="選手・大会実績"
            description="所属選手と、大会での成績をご紹介します。"
          />
          <div className="mt-10">
            <PendingSlot label="選手・大会実績は準備中です。掲載できる内容が揃い次第こちらに載せます。" />
          </div>
        </div>
      </section>

      {/* ── 研究 ───────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading eyebrow="RESEARCH" title="研究への取り組み" />
          {/* ⚠️ 仮テキスト。研究テーマ・所属・発表予定が決まり次第差し替える。 */}
          <div className="mt-10 flex items-start gap-5 rounded-card border border-border bg-surface px-6 py-7 sm:px-8">
            <Microscope size={26} className="mt-0.5 hidden shrink-0 text-gold-600 sm:block" />
            <div>
              <p className="text-sm leading-relaxed text-navy-700 sm:text-base">
                指導と並行して、近代五種の育成に関する研究に取り組んでいきます。修士・博士課程での研究、学会での発表、論文を通じて得たものを、日々の練習の組み立てに戻していくことを考えています。
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                具体的なテーマと発表の予定は、決まり次第こちらでお知らせします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 概要 ───────────────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading eyebrow="OVERVIEW" title="アカデミー概要" />
          <dl className="mt-10 divide-y divide-border border-y border-border">
            {[
              { label: "名称", value: SITE.name },
              ...FACTS,
              {
                label: "会費",
                value: (
                  <>
                    月会費その他の定額の会費はいただきません。施設利用料・大会参加費・スポーツ保険料など、活動に直接必要となる費用のみ実費をご負担いただきます。
                    <Link
                      href="/terms"
                      className="ml-1 whitespace-nowrap font-bold text-navy-800 underline decoration-gold-400 underline-offset-4 transition-colors hover:text-gold-600"
                    >
                      クラブ規約
                    </Link>
                  </>
                ),
              },
              { label: "指導者", value: COACHES.map((c) => c.name).join(" / ") },
              { label: "連絡先", value: SITE.email },
            ].map((row) => (
              <div key={row.label} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="font-display text-sm font-bold text-navy-800">{row.label}</dt>
                <dd className="text-sm leading-relaxed text-muted">{row.value}</dd>
              </div>
            ))}
          </dl>
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
