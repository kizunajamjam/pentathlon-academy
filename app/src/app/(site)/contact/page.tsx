import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Mail, MapPin, Phone } from "lucide-react";

import { InstagramIcon } from "@/components/icons/instagram-icon";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "ペンタスロンアカデミーへの体験・見学のお申し込み、入会や料金についてのお問い合わせはこちらから。",
};

/*
 * よくある質問（案はこちらで作成。オーナーに確認してもらう前提）。
 * 確認済みの事実だけで答える: 年齢不問・未経験可、月会費と指導料なし・実費のみ
 * （クラブ規約 第5条〜第7条）、体験は実費のみ、活動は大阪・兵庫、個別/グループ、
 * 未成年は保護者の同意（第4条）。分からないこと（送迎・大会出場の扱いなど）は書かない。
 */
const FAQ: { q: string; a: string }[] = [
  {
    q: "近代五種も、どの種目もやったことがありません。参加できますか？",
    a: "はい、未経験の方も歓迎します。一人ひとりのペースに合わせて、できることから取り組んでいきます。水泳や陸上など、これまで続けてきた競技があれば、それも活かせます。",
  },
  {
    q: "何歳から参加できますか？",
    a: "年齢は問いません。小学生から大人の方まで参加できます。未成年の方は、保護者の方の同意のうえでお申し込みください。",
  },
  {
    q: "費用はどのくらいかかりますか？",
    a: "月会費や指導料はいただいていません。施設利用料・大会参加費・スポーツ保険料など、活動に必要な実費のみご負担いただきます。実費の目安は種目や参加の仕方によって変わるため、お問い合わせください。",
  },
  {
    q: "体験・見学はできますか？",
    a: "随時受け付けています。費用は施設利用料などの実費のみです。練習スケジュールをご覧のうえ、ご希望の曜日をお知らせください。",
  },
  {
    q: "どこで練習していますか？",
    a: "大阪府・兵庫県の施設で練習しています。曜日ごとに種目と場所が変わります。詳しくは練習スケジュールをご覧ください。",
  },
  {
    q: "毎回すべての練習に参加しないといけませんか？",
    a: "いいえ。参加する日や種目は、ご希望を伺って相談のうえ決めます。練習は個別・グループのどちらにも対応しています。",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero title="お問い合わせ" titleEn="CONTACT" />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="FORM"
              title="フォームからのお問い合わせ"
              description="体験・見学のお申し込み、入会や料金についてのご質問など、お気軽にご連絡ください。担当者よりご返信いたします。"
            />
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>

          <aside className="lg:pt-4">
            <div className="rounded-card border border-border bg-surface p-7">
              <p className="eyebrow text-[10px] text-gold-700">DIRECT</p>
              <h2 className="mt-3 text-lg text-navy-800">
                {SITE.tel ? "お電話・メールでも" : "メールでも"}
              </h2>
              <ul className="mt-6 space-y-5 text-sm">
                {SITE.tel && (
                  <li className="flex items-start gap-3">
                    <Phone size={17} className="mt-0.5 shrink-0 text-gold-600" />
                    <span>
                      <span className="block text-xs text-muted">電話</span>
                      <span className="mt-0.5 block font-display text-base text-navy-800">
                        {SITE.tel}
                      </span>
                    </span>
                  </li>
                )}
                <li>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="group flex items-start gap-3"
                  >
                    <Mail size={17} className="mt-0.5 shrink-0 text-gold-600" />
                    <span>
                      <span className="block text-xs text-muted">メール</span>
                      <span className="mt-0.5 block break-all text-navy-800 underline decoration-gold-400 underline-offset-4 transition-colors group-hover:text-gold-600">
                        {SITE.email}
                      </span>
                    </span>
                  </a>
                </li>
                {SITE.address && (
                  <li className="flex items-start gap-3">
                    <MapPin size={17} className="mt-0.5 shrink-0 text-gold-600" />
                    <span>
                      <span className="block text-xs text-muted">所在地</span>
                      <span className="mt-0.5 block leading-relaxed text-navy-800">
                        {SITE.address}
                      </span>
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Instagram の DM でも体験申し込みを受け付けているため導線を用意する */}
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center gap-3 rounded-card border border-border bg-white p-5 transition-colors hover:border-navy-800"
            >
              <InstagramIcon size={22} className="shrink-0 text-gold-600" />
              <span>
                <span className="block text-sm font-bold text-navy-800">
                  Instagram の DM でも受付中
                </span>
                <span className="mt-1 block text-xs text-muted">
                  「体験希望」とメッセージをお送りください。{SITE.instagramHandle}
                </span>
              </span>
            </a>

            <p className="mt-5 text-xs leading-relaxed text-muted">
              ご記入いただいた個人情報は、お問い合わせへの回答およびご案内のためにのみ使用します。
              詳しくは
              <Link
                href="/privacy"
                className="mx-0.5 underline decoration-gold-400 underline-offset-4 hover:text-gold-600"
              >
                プライバシーポリシー
              </Link>
              をご覧ください。
            </p>
          </aside>
        </div>
      </section>

      {/* ── よくある質問 ─────────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-20 bg-surface py-16 sm:py-20 lg:scroll-mt-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading eyebrow="FAQ" title="よくある質問" />
          <div className="mt-10 divide-y divide-border border-y border-border bg-white">
            {FAQ.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-navy-800 sm:text-base [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-gold-600 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-navy-700">{item.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            練習の曜日と場所は
            <Link
              href="/schedule"
              className="mx-0.5 font-bold text-navy-800 underline decoration-gold-400 underline-offset-4 hover:text-gold-600"
            >
              練習スケジュール
            </Link>
            をご覧ください。
          </p>
        </div>
      </section>
    </>
  );
}
