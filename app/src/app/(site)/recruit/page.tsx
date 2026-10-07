import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button-link";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "コーチ・スタッフ募集",
  description:
    "ペンタスロンアカデミーを一緒につくってくださるコーチ・スタッフを募集しています。近代五種の経験は必須ではありません。",
};

// 募集文はオーナー提供。1段落 = 配列の1要素。
const INTRO = [
  "ペンタスロンアカデミーは、近代五種を通じて、子どもたちがスポーツの楽しさを知り、「挑戦する力」、「考える力」、「やり抜く力」を育むことのできる環境をつくることを目指しています。",
  "近代五種は、フェンシング・オブスタクル・水泳・射撃・ランニングの5種目に取り組む総合型スポーツです。",
  "一つの競技だけではなく、さまざまな種目に挑戦する中で、自分の得意なことを見つけたり、苦手なことを乗り越えたりすることができます。",
  "私たちは、この近代五種の魅力をより多くの子どもたちに伝え、競技を続けたいと思える環境を一緒につくっていきたいと考えています。",
  "そのために、ペンタスロンアカデミーの活動を支えてくださる方を募集しています。",
];

const WELCOME = [
  "近代五種に関わってみたい",
  "これまでの競技経験や専門知識を活かしたい",
  "子どもたちの成長をサポートしたい",
  "スポーツを通じた活動に関わりたい",
  "新しいアカデミーを一緒につくっていきたい",
];

const ROLES: { title: string; body: string[] }[] = [
  {
    title: "競技・練習のサポート",
    body: [
      "近代五種5種目の練習や活動をサポートしてくださる方を募集しています。",
      "各種目の競技経験者や指導経験者はもちろん、専門的な知識や経験をお持ちの方も歓迎します。",
    ],
  },
  {
    title: "選手の育成・サポート",
    body: [
      "選手とのコミュニケーションや練習のサポートなど、選手が安心して競技に取り組み、成長していける環境づくりに協力してくださる方。",
      "競技の技術だけではなく、選手一人ひとりの成長を見守ってくださる方を歓迎します。",
    ],
  },
  {
    title: "大会・イベントの運営",
    body: ["大会、記録会、体験会などの準備や運営、参加者のサポートをしてくださる方。"],
  },
  {
    title: "広報・発信",
    body: [
      "写真・動画撮影、SNS、Webサイト、デザインなど、ペンタスロンアカデミーの活動や近代五種の魅力を発信してくださる方。",
    ],
  },
  {
    title: "その他",
    body: [
      "「自分の経験をこんな形で活かせるのではないか」「こういうことなら協力できる」というアイデアも大歓迎です。",
      "決まった役割だけではなく、それぞれの経験や得意なことを活かしながら、一緒にアカデミーの形をつくっていきたいと考えています。",
    ],
  },
];

const FEE = [
  "近代五種は、5つの種目に取り組む競技です。そのため、選手には競技用具、施設利用、大会参加、遠征など、さまざまな費用がかかります。",
  "私たちは、選手やご家族の経済的な負担を少しでも軽くし、費用を理由に近代五種への挑戦を諦めることがないようにしたいと考えています。",
  "そのため、ペンタスロンアカデミーでは、現在、選手から指導料をいただいていません。",
  "もちろん、指導やサポートに価値がないという考えではありません。選手の成長を支える指導者やスタッフの力は、アカデミーにとって欠かすことのできない大切な存在です。",
  "そのうえで、選手ができるだけ競技そのものに集中できる環境をつくるために、私たちはこの方針を大切にしています。",
  "この考え方をご理解いただき、アカデミーの理念に共感して活動に協力してくださる方を募集しています。",
];

const PEOPLE = [
  "選手として競技する人。",
  "選手を指導する人。",
  "選手を支える人。",
  "活動を運営する人。",
  "近代五種の魅力を伝える人。",
];

const CLOSING = [
  "さまざまな人が関わることで、アカデミーはより良い環境になっていきます。",
  "近代五種に少しでも興味がある方。子どもたちの挑戦を応援したい方。これまでの経験を活かしてスポーツに関わりたい方。そして、これからのペンタスロンアカデミーを一緒につくっていきたい方。",
  "ぜひ、私たちに力を貸してください。",
  "あなたの経験や知識、そして「応援したい」という気持ちが、選手の新しい挑戦を支える力になります。",
  "ペンタスロンアカデミーで、一緒に近代五種の未来をつくっていきましょう。",
];

const paragraph = "text-sm leading-[1.9] text-muted sm:text-base";

export default function RecruitPage() {
  return (
    <>
      <PageHero title="コーチ・スタッフ募集" titleEn="RECRUIT" />

      {/* ── 導入 ───────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading
            eyebrow="JOIN US"
            title="ペンタスロンアカデミーを一緒につくってくださる方を募集しています"
          />
          <div className="mt-8 space-y-4">
            {INTRO.map((p) => (
              <p key={p} className={paragraph}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── 歓迎する方 ─────────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading eyebrow="WELCOME" title="こんな方を歓迎します" />
          <ul className="mt-8 space-y-3">
            {WELCOME.map((w) => (
              <li
                key={w}
                className="rounded-card border border-border bg-white px-5 py-4 text-sm font-bold text-navy-800 sm:text-base"
              >
                「{w}」
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-4">
            <p className={paragraph}>そんな思いをお持ちの方を歓迎します。</p>
            <p className="text-sm font-bold leading-[1.9] text-navy-800 sm:text-base">
              近代五種の経験は必須ではありません。
            </p>
            <p className={paragraph}>
              フェンシング、オブスタクル、水泳、射撃、ランニングのいずれかの経験がある方はもちろん、スポーツ指導、トレーニング、コンディショニング、運営、広報など、それぞれの経験や得意分野を活かしていただけます。
            </p>
          </div>
        </div>
      </section>

      {/* ── お願いしたいこと ───────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading eyebrow="ROLES" title="お願いしたいこと" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {ROLES.map((r, i) => (
              <div key={r.title} className="min-w-0 rounded-card border border-border bg-white p-6">
                <p className="font-display text-xs font-bold text-gold-700">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-lg text-navy-800">{r.title}</h3>
                <div className="mt-3 space-y-3">
                  {r.body.map((b) => (
                    <p key={b} className="text-sm leading-relaxed text-muted">
                      {b}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 指導料について ─────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading eyebrow="ABOUT FEES" title="指導料について" />
          <div className="mt-8 space-y-4">
            {FEE.map((p) => (
              <p key={p} className={paragraph}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── 結び ───────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading eyebrow="FUTURE" title="一緒に、近代五種の未来をつくりませんか" />
          <ul className="mt-8 space-y-1.5 border-l-2 border-gold-500 pl-5">
            {PEOPLE.map((p) => (
              <li key={p} className="font-display text-base font-bold text-navy-800 sm:text-lg">
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-4">
            {CLOSING.map((p) => (
              <p key={p} className={paragraph}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-800 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <SectionHeading
            eyebrow="CONTACT"
            title="ご興味のある方は、お気軽にお問い合わせください。"
            tone="light"
            align="center"
          />
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact">お問い合わせ</ButtonLink>
            <ButtonLink href="/about" variant="ghost">
              アカデミーについて
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
