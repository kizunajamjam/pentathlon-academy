import type { Metadata } from "next";
import { Building2, Dumbbell, Plane, ShieldCheck, Shirt, MessagesSquare } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "スポンサー募集",
  description:
    "ペンタスロンアカデミーの考えに共感し、選手の挑戦を支えてくださる企業・団体を募集しています。ご支援は指導者の保険料、トレーニング器具、遠征費にあてます。",
};

/*
 * スポンサー募集。内容はオーナーからの依頼（LINE）をもとにしている。
 *   - 指導料を無料にしていることもあり、アカデミーの考えに共感してくださる企業を募りたい
 *   - 使いみちは、スポーツ指導者への保険料・トレーニング器具の購入・遠征費
 *   - スポンサー側のメリット: ホームページ掲載、選手ユニフォームにロゴ、その他ご相談のうえ
 * 金額やプランは決まっていないので書かない（決まったらここに足す）。
 */
const INTRO = [
  "ペンタスロンアカデミーでは、選手やご家族の経済的な負担を少しでも軽くし、費用を理由に近代五種への挑戦を諦めることがないよう、選手から指導料をいただいていません。",
  "一方で、5つの種目に取り組む近代五種は、指導・用具・遠征など、活動を続けるためにさまざまな費用がかかります。",
  "そこで、アカデミーの考えに共感し、選手の挑戦を一緒に支えてくださる企業・団体の皆さまを募集しています。",
];

const USES: { icon: typeof ShieldCheck; title: string; body: string }[] = [
  {
    icon: ShieldCheck,
    title: "スポーツ指導者の保険料",
    body: "指導者が安心して選手と向き合えるよう、指導中の万一に備える保険の費用にあてます。",
  },
  {
    icon: Dumbbell,
    title: "トレーニング器具の購入",
    body: "5種目それぞれの練習に必要な用具や、体づくりのためのトレーニング器具をそろえます。",
  },
  {
    icon: Plane,
    title: "遠征費",
    body: "選手が全国の大会や合宿に挑戦できるよう、遠征にかかる費用を支えます。",
  },
];

const BENEFITS: { icon: typeof Building2; title: string; body: string }[] = [
  {
    icon: Building2,
    title: "ホームページへの掲載",
    body: "このホームページに、貴社のお名前・ロゴを掲載します。",
  },
  {
    icon: Shirt,
    title: "選手ユニフォームへのロゴ掲出",
    body: "選手が練習や大会で着用するユニフォームに、貴社のロゴを入れます。",
  },
  {
    icon: MessagesSquare,
    title: "その他、ご相談のうえ",
    body: "ご支援の形や内容に合わせて、ご希望をうかがいながら一緒に決めさせていただきます。",
  },
];

const paragraph = "text-sm leading-[1.9] text-muted sm:text-base";

function CardGrid({ items }: { items: { icon: typeof Building2; title: string; body: string }[] }) {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-3">
      {items.map(({ icon: Icon, title, body }) => (
        <div key={title} className="min-w-0 rounded-card border border-border bg-white p-6">
          <Icon size={28} className="text-gold-600" aria-hidden="true" />
          <h3 className="mt-4 text-base text-navy-800 sm:text-lg">{title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
        </div>
      ))}
    </div>
  );
}

export default function SponsorPage() {
  return (
    <>
      <PageHero title="スポンサー募集" titleEn="SPONSOR" />

      {/* ── 導入 ───────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading
            eyebrow="SUPPORT US"
            title="選手の挑戦を、一緒に支えてくださる企業を募集しています"
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

      {/* ── ご支援の使いみち ───────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading eyebrow="USE OF FUNDS" title="ご支援の使いみち" />
          <CardGrid items={USES} />
        </div>
      </section>

      {/* ── スポンサー特典 ─────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading eyebrow="BENEFITS" title="ご支援いただいた企業さまへ" />
          <CardGrid items={BENEFITS} />
        </div>
      </section>

      <section className="bg-navy-800 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <SectionHeading
            eyebrow="CONTACT"
            title="ご関心をお持ちいただけましたら、お気軽にお問い合わせください。"
            tone="light"
            align="center"
          />
          <p className="mt-6 text-sm leading-relaxed text-navy-200">
            お問い合わせフォームで「スポンサー・協賛について」をお選びください。
            内容をうかがったうえで、担当者よりご連絡いたします。
          </p>
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
