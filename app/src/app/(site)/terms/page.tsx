import type { Metadata } from "next";

import { PageHero } from "@/components/ui/page-hero";
import { SITE } from "@/lib/constants/site";
import { TERMS, TERMS_EFFECTIVE_FROM } from "@/lib/constants/terms";

export const metadata: Metadata = {
  title: "クラブ規約",
  description:
    "ペンタスロンアカデミーのクラブ規約です。目的、活動、会費と実費の扱い、指導者、会計についてまとめています。",
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="クラブ規約" titleEn="TERMS" />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <p className="rounded-card border border-gold-200 bg-gold-50 px-5 py-4 text-sm leading-relaxed text-navy-700 sm:px-6">
            本クラブは<strong className="font-bold">月会費その他の定額の会費を徴収しません</strong>（第5条）。
            施設利用料や大会参加費など、活動に直接必要となる費用のみを実費としてご負担いただきます（第6条）。
          </p>

          <div className="mt-12 space-y-10">
            {TERMS.map((article) => {
              // 項が2つ以上ある条だけ番号を振る。1つしかない条に「1」と出ても意味がない。
              const paragraphCount = article.blocks.filter((b) => typeof b === "string").length;
              let paragraphNo = 0;

              return (
                <article key={article.no}>
                  <h2 className="text-lg text-navy-800">
                    {article.no}
                    <span className="ml-2 text-base font-normal text-muted">
                      （{article.title}）
                    </span>
                  </h2>

                  <div className="mt-4 space-y-3">
                    {article.blocks.map((block, i) =>
                      typeof block === "string" ? (
                        <p
                          key={i}
                          className="grid gap-2 text-sm leading-relaxed text-navy-700 sm:grid-cols-[1.5rem_1fr] sm:gap-3"
                        >
                          {paragraphCount > 1 && (
                            <span className="font-display text-sm font-bold text-gold-600">
                              {++paragraphNo}
                            </span>
                          )}
                          <span className={paragraphCount > 1 ? "" : "sm:col-span-2"}>{block}</span>
                        </p>
                      ) : (
                        <ol
                          key={i}
                          className="ml-0 list-decimal space-y-1.5 pl-6 text-sm leading-relaxed text-navy-700 sm:ml-[2.25rem]"
                        >
                          {block.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ol>
                      ),
                    )}
                  </div>
                </article>
              );
            })}

            <article>
              <h2 className="text-lg text-navy-800">附則</h2>
              <p className="mt-4 text-sm leading-relaxed text-navy-700">
                本規約は、{TERMS_EFFECTIVE_FROM}から施行する。
              </p>
            </article>
          </div>

          <p className="mt-12 border-t border-border pt-6 text-sm leading-relaxed text-muted">
            規約についてご不明な点は、{SITE.email} または Instagram（{SITE.instagramHandle}）
            までお問い合わせください。
          </p>
        </div>
      </section>
    </>
  );
}
