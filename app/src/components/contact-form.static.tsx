import { AlertCircle } from "lucide-react";

import { SITE } from "@/lib/constants/site";

/*
 * GitHub Pages プレビュー用のお問い合わせフォーム代替。
 *
 * 静的書き出しでは Server Actions が使えず、本来のフォームはビルドできない。
 * プレビューでは送信できないことを明示し、実際の連絡手段へ誘導する。
 *
 * Pages 用のビルド時に、CI がこのファイルを contact-form.tsx へ上書きコピーする
 * （.github/workflows/pages.yml 参照）。リポジトリ上の本体は変更しない。
 */
export function ContactForm() {
  return (
    <div className="rounded-card border border-gold-200 bg-gold-50 px-6 py-8">
      <p className="flex items-start gap-2.5 text-sm font-bold text-navy-800">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-gold-600" />
        このページは確認用のプレビューのため、フォームからの送信はできません
      </p>
      <p className="mt-4 text-sm leading-relaxed text-navy-700">
        お問い合わせは下記へお願いします。本番公開時には、この場所に
        お名前・メールアドレス・お問い合わせ種別・内容を入力するフォームが表示されます。
      </p>
      <ul className="mt-5 space-y-2 text-sm text-navy-800">
        <li>電話: {SITE.tel}</li>
        <li>メール: {SITE.email}</li>
        <li>
          Instagram:{" "}
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-gold-400 underline-offset-4"
          >
            {SITE.instagramHandle}
          </a>
        </li>
      </ul>
    </div>
  );
}
