import type { Metadata } from "next";

import { PageHero } from "@/components/ui/page-hero";
import { SITE } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "ペンタスロンアカデミーの個人情報の取り扱いについて。お問い合わせでお預かりする情報、利用目的、外部サービスへの委託、開示等のご請求の窓口をまとめています。",
};

// 制定日。内容を変えたら「改定」として日付を足す。
const ESTABLISHED = "2026年10月14日";

// 個人情報の問い合わせ窓口（オーナー確認済み: docs/HEARING-review.txt の E-2）
const CONTACT_NAME = `${SITE.name} 代表`;

/*
 * 外部サービスは、このサイトで実際に使っているものだけを載せる。
 * 環境変数で入れたり外したりできるもの（迷惑送信対策・アクセス解析・通知メール）は、
 * 設定されているときだけ表示する。ページはビルド時に作られるので、
 * 設定を変えたら再デプロイすれば文面も追従する。
 */
const USES_TURNSTILE = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const USES_PLAUSIBLE =
  Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) && process.env.NEXT_PUBLIC_IS_PREVIEW !== "1";
// 通知メールは、キー・宛先・送信元の3つがそろったときだけ送られる（contact/actions.ts と同じ条件）
const USES_RESEND = Boolean(
  process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFY_TO && process.env.CONTACT_NOTIFY_FROM,
);

type Block = string | string[];
type Section = { title: string; blocks: Block[] };

const SERVICES: string[] = [
  "Supabase（お問い合わせ内容の保管）",
  "Netlify（このサイトの配信）",
  ...(USES_RESEND ? ["Resend（お問い合わせを受け付けた旨の、担当者への通知メールの送信）"] : []),
  ...(USES_TURNSTILE ? ["Cloudflare Turnstile（フォームへの機械的な迷惑送信の防止）"] : []),
  ...(USES_PLAUSIBLE ? ["Plausible Analytics（アクセス数の集計）"] : []),
  "Google（Gmail によるメールの受信・返信）",
  "Meta（Instagram のダイレクトメッセージでのやり取り）",
];

const SECTIONS: Section[] = [
  {
    title: "取得する情報",
    blocks: [
      "本クラブは、次の情報を取得します。",
      [
        "お問い合わせフォームにご入力いただいた、お名前、メールアドレス、電話番号（任意）、お問い合わせの種別及び内容",
        "お問い合わせフォームの送信時に添えられる、このサイトで最初に開いたページと、このサイトに来る前に見ていたサイトの名前（SNS などのリンクに付いた識別名を含む）",
        "メールまたは Instagram のダイレクトメッセージでお問い合わせいただいた場合は、そこに記載された情報",
      ],
    ],
  },
  {
    title: "利用目的",
    blocks: [
      "取得した情報は、次の目的にのみ利用します。",
      [
        "お問い合わせへの回答",
        "体験・見学・入会に関するご案内及びご連絡",
        "お問い合わせの件数や、どこからこのサイトを知っていただいたかの集計による、サイト及び活動の改善（集計結果は個人が特定できない形で扱います）",
      ],
    ],
  },
  {
    title: "第三者への提供",
    blocks: [
      "本クラブは、法令に基づく場合を除き、ご本人の同意を得ずに個人情報を第三者に提供しません。",
    ],
  },
  {
    title: "外部サービスの利用",
    blocks: [
      "本クラブは、このサイトの運営及びお問い合わせへの対応のため、次の外部サービスを利用しており、その範囲で個人情報の取り扱いを委託しています。",
      SERVICES,
      "これらのサービスのサーバーは、アメリカ合衆国など日本国外にある場合があります。各サービスの個人情報の取り扱いは、それぞれのプライバシーポリシーをご確認ください。",
    ],
  },
  {
    title: "Cookie 等の利用",
    blocks: [
      "このサイトでは、お問い合わせの流入元を集計するため、最初に開いたページと直前に見ていたサイトの名前を、お使いのブラウザに一時的に保存します。この情報はブラウザを閉じると消え、お問い合わせフォームを送信したときにだけ本クラブに送られます。",
      ...(USES_PLAUSIBLE
        ? [
            "アクセス数の集計には、Cookie を使わず、個人を特定する情報を保存しない Plausible Analytics を利用しています。",
          ]
        : []),
      ...(USES_TURNSTILE
        ? [
            "お問い合わせフォームでは、機械的な迷惑送信を防ぐため Cloudflare Turnstile を利用しており、その判定のためにブラウザの情報が Cloudflare 社に送信されます。",
          ]
        : []),
    ],
  },
  {
    title: "安全管理",
    blocks: [
      "本クラブは、個人情報の漏えい、滅失または毀損を防ぐため、お問い合わせ内容を閲覧できる者を担当者に限り、管理画面へのログインには二段階認証を求めるなど、必要かつ適切な措置を講じます。",
      "個人情報は、利用目的の達成に必要な期間保管し、不要となったものは削除します。",
    ],
  },
  {
    title: "開示等のご請求",
    blocks: [
      "ご本人から、ご自身の個人情報の利用目的の通知、開示、訂正、追加、削除、利用の停止、消去または第三者への提供の停止のご請求があった場合は、ご本人であることを確認したうえで、法令に従い遅滞なく対応します。下記の窓口までご連絡ください。",
    ],
  },
  {
    title: "本ポリシーの変更",
    blocks: [
      "本クラブは、法令の改正や運営の変更に応じて、本ポリシーを変更することがあります。変更した場合は、このページでお知らせします。",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="プライバシーポリシー" titleEn="PRIVACY POLICY" />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-sm leading-relaxed text-navy-700">
            {SITE.name}（以下「本クラブ」といいます）は、このサイト及びお問い合わせを通じてお預かりする個人情報を、
            個人情報の保護に関する法律その他の関係法令を守り、以下のとおり取り扱います。
          </p>

          <div className="mt-12 space-y-10">
            {SECTIONS.map((section, i) => (
              <article key={section.title}>
                <h2 className="text-lg text-navy-800">
                  <span className="mr-2 font-display text-gold-700">{i + 1}.</span>
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3">
                  {section.blocks.map((block, j) =>
                    typeof block === "string" ? (
                      <p key={j} className="text-sm leading-relaxed text-navy-700">
                        {block}
                      </p>
                    ) : (
                      <ul
                        key={j}
                        className="list-disc space-y-1.5 pl-6 text-sm leading-relaxed text-navy-700"
                      >
                        {block.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </article>
            ))}

            <article>
              <h2 className="text-lg text-navy-800">
                <span className="mr-2 font-display text-gold-700">{SECTIONS.length + 1}.</span>
                お問い合わせ窓口
              </h2>
              <div className="mt-4 rounded-card border border-border bg-surface px-5 py-4 text-sm leading-relaxed text-navy-700 sm:px-6">
                <p className="font-bold text-navy-800">{CONTACT_NAME}</p>
                <p className="mt-1">
                  メール:{" "}
                  <a
                    href={`mailto:${SITE.email}`}
                    className="break-all underline decoration-gold-400 underline-offset-4 hover:text-gold-600"
                  >
                    {SITE.email}
                  </a>
                </p>
              </div>
            </article>
          </div>

          <p className="mt-12 border-t border-border pt-6 text-sm text-muted">{ESTABLISHED} 制定</p>
        </div>
      </section>
    </>
  );
}
