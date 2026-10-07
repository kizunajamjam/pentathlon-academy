import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Compass, ExternalLink, HeartHandshake, Microscope, Sparkles } from "lucide-react";

import { DisciplineIcon } from "@/components/icons/discipline-icons";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHero } from "@/components/ui/page-hero";
import { PendingSlot } from "@/components/ui/pending-slot";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { SectionHeading } from "@/components/ui/section-heading";
import { Standards } from "@/components/ui/standards";
import { DISCIPLINES, PARTNERS, SITE, STAFF, STANDARDS } from "@/lib/constants/site";
import { listPublishedCoaches } from "@/lib/db/coaches";
import { assetPath } from "@/lib/utils/asset";

export const metadata: Metadata = {
  title: "アカデミーについて",
  description:
    "ペンタスロンアカデミーの理念と指導方針、指導者の紹介、強化選手規定、連携先、今後の研究についてご紹介します。",
};

// ⚠️ 仮テキスト。正式な理念・実績が決まり次第この配列を差し替える。
//
// 「競技力よりも先に、人間力向上を」を先頭に置くのはオーナー指定。
// EQ測定は具体的な検査名・頻度を決めていないため（オーナー確認済み）、
// 本文は「取り入れている」ことだけに留めている。
const POLICIES = [
  {
    icon: HeartHandshake,
    title: "競技力よりも先に、人間力向上を",
    body: "剣やレーザーピストルの扱い、譲り合って使う施設、対戦相手への礼。近代五種は道具と人に囲まれて成り立つ競技です。アカデミーではEQ（心の知能指数）の測定を取り入れ、自分の感情や人との関わり方を客観的に見つめながら、競技を通じて人としての力を高めていきます。",
  },
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
];

/*
 * アカデミー概要。
 *
 * 会費はクラブ規約 第5条・第6条がそのまま根拠になる（月会費は取らず、実費のみ）。
 * 練習日は実際の週間活動に合わせている（曜日ごとに種目と場所が変わる）。
 * 初級/選手のクラス分けは実際には設けていないため、項目ごと持たない。
 */
const FACTS = [
  { label: "対象", value: "小学生〜社会人" },
  { label: "練習形態", value: "個別 / グループ（ご希望に合わせてご相談ください）" },
  {
    label: "練習日",
    value: "月〜日（曜日ごとに種目と場所が変わります。参加される日は相談のうえ決めています）",
  },
];

export default async function AboutPage() {
  const coaches = await listPublishedCoaches();

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
              description="ペンタスロンアカデミーは、近代五種に取り組める環境が関西にないという課題から立ち上げました。"
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
              5種目に取り組むなかで身につく、挑戦する力・考える力・やり抜く力。近代五種を通じて、人生を切り拓く総合力を育むことを目指しています。
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              いずれ、1箇所で近代五種のすべての練習ができる練習拠点をつくり、競技人口を増やし、近代五種を通じてスポーツ教育が行われる環境をつくること。それが私たちの夢です。
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
                  <p className="mt-3 text-left text-sm leading-relaxed text-muted">{p.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── 指導者 ─────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading eyebrow="COACHING TEAM" title="指導者" />
          {/*
            写真を持たないので、カードは肩書きバッジ＋氏名＋経歴の箇条書きだけ。
            資格・実績はコーチによって行数が大きく違う（3〜10行）ため、
            グリッドで同じ行の高さが揃っても不自然にならないテキスト主体の構成にしている。

            列数は人数に合わせる。3列に2人だと右が空くため。
            Tailwind は文字列結合したクラス名を purge するので、完全な形で持つ。
          */}
          <div
            className={`mt-10 grid gap-6 sm:grid-cols-2 ${
              coaches.length > 2 ? "lg:grid-cols-3" : "lg:max-w-3xl"
            }`}
          >
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="min-w-0 rounded-card border border-border bg-white p-6"
              >
                <span className="inline-flex rounded-full bg-navy-50 px-3 py-1 text-xs font-bold text-navy-800">
                  {coach.title}
                </span>
                <p className="mt-4 font-display text-lg font-bold text-navy-800">{coach.name}</p>
                <ul className="mt-3 space-y-1.5">
                  {/*
                    経歴には「大阪体育大学体育学部スポーツ教育学科卒業」のように
                    文節の切れ目を持たない長い行がある。word-break: auto-phrase は
                    文節で折れない行をそのまま1行として扱うため、幅の狭い端末では
                    カードごと画面からはみ出す。overflow-wrap: anywhere は
                    「他に折り返しようがないときだけ」効くので、余裕があるときの
                    折り返し位置は変えずに、はみ出しだけを防げる。
                  */}
                  {coach.bio.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-sm leading-relaxed text-muted [overflow-wrap:anywhere]"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── スタッフ ───────────────────────────────────────────────── */}
      <section className="bg-white pb-16 sm:pb-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading eyebrow="STAFF" title="スタッフ" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
            {STAFF.map((s) => (
              <div key={s.name} className="min-w-0 rounded-card border border-border bg-white p-6">
                <span className="inline-flex rounded-full bg-navy-50 px-3 py-1 text-xs font-bold text-navy-800">
                  {s.title}
                </span>
                <p className="mt-4 font-display text-lg font-bold text-navy-800">{s.name}</p>
                <ul className="mt-3 space-y-1.5">
                  {s.bio.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-sm leading-relaxed text-muted [overflow-wrap:anywhere]"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-navy-700">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">
            一緒にアカデミーをつくってくださる方を募集しています。{" "}
            <Link
              href="/recruit"
              className="font-bold text-navy-800 underline decoration-gold-400 underline-offset-4 transition-colors hover:text-gold-600"
            >
              コーチ・スタッフ募集
            </Link>
          </p>
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

      {/* ── 強化選手規定 ───────────────────────────────────────── */}
      {/*
        種目ごとに小見出しとアンカー（#standards-<種目id>）を持たせ、
        競技紹介ページの「〇〇強化選手規定を見る」から直接飛べるようにする。
      */}
      <section id="standards" className="scroll-mt-20 bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="STANDARDS"
            title="強化選手規定"
            description="これまで取り組んできた競技がある方に向けて、種目ごとにひとつの目安として規定を示しています。入会の条件ではありませんので、届いていなくても構いません。"
          />
          <div className="mt-12 space-y-14">
            {DISCIPLINES.map((d) => {
              const standard = STANDARDS[d.id];
              return (
                <div key={d.id} id={`standards-${d.id}`} className="scroll-mt-24">
                  <div className="flex items-center gap-3 border-b border-border pb-3">
                    <DisciplineIcon id={d.id} className="h-10 w-10 shrink-0 object-contain" />
                    <h3 className="text-lg text-navy-800">{d.name}強化選手規定</h3>
                  </div>
                  <div className="mt-6">
                    <Standards standard={standard} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-12 rounded-card border border-border bg-white px-5 py-4 text-sm leading-relaxed text-navy-700 sm:px-6">
            これまでの競技で積み上げてきた力は、近代五種でそのまま武器になります。
          </p>
        </div>
      </section>

      {/* ── 連携先 ─────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading
            eyebrow="PARTNERS"
            title="連携先"
            description="現状、5種目を支える環境はアカデミーだけでは揃っていないので、専門の施設・クラブと連携して練習環境をつくっています。"
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {PARTNERS.map((partner) => (
              <li
                key={partner.name}
                className="overflow-hidden rounded-card border border-border bg-surface"
              >
                {partner.photo && (
                  <Image
                    src={assetPath(partner.photo)}
                    alt={`${partner.name}の施設`}
                    width={1546}
                    height={1060}
                    className="aspect-[3/2] w-full object-cover"
                  />
                )}
                <div className="px-6 py-6">
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
                </div>
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
              { label: "指導者", value: coaches.map((c) => c.name).join(" / ") },
              {
                label: "連絡先",
                value: (
                  <a
                    href={`mailto:${SITE.email}`}
                    className="font-bold text-navy-800 underline decoration-gold-400 underline-offset-4 transition-colors hover:text-gold-600"
                  >
                    {SITE.email}
                  </a>
                ),
              },
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
