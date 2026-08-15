import type { Metadata } from "next";
import { AtSign, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "ペンタスロンアカデミーへの体験・見学のお申し込み、入会や料金についてのお問い合わせはこちらから。",
};

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
              description="体験・見学のお申し込み、入会や料金についてのご質問など、お気軽にご連絡ください。2〜3営業日以内に担当者よりご返信いたします。"
            />
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>

          <aside className="lg:pt-4">
            <div className="rounded-card border border-border bg-surface p-7">
              <p className="eyebrow text-[10px] text-gold-600">DIRECT</p>
              <h2 className="mt-3 text-lg text-navy-800">お電話・メールでも</h2>
              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex items-start gap-3">
                  <Phone size={17} className="mt-0.5 shrink-0 text-gold-600" />
                  <span>
                    <span className="block text-xs text-muted">電話</span>
                    <span className="mt-0.5 block font-display text-base text-navy-800">
                      {SITE.tel}
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={17} className="mt-0.5 shrink-0 text-gold-600" />
                  <span>
                    <span className="block text-xs text-muted">メール</span>
                    <span className="mt-0.5 block break-all text-navy-800">{SITE.email}</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={17} className="mt-0.5 shrink-0 text-gold-600" />
                  <span>
                    <span className="block text-xs text-muted">所在地</span>
                    <span className="mt-0.5 block leading-relaxed text-navy-800">
                      {SITE.address}
                    </span>
                  </span>
                </li>
              </ul>
            </div>

            {/* Instagram の DM でも体験申し込みを受け付けているため導線を用意する */}
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center gap-3 rounded-card border border-border bg-white p-5 transition-colors hover:border-navy-800"
            >
              <AtSign size={22} className="shrink-0 text-gold-600" />
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
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
