import { ButtonLink } from "@/components/ui/button-link";

// 404 の本文。app/not-found.tsx から使う。
export function NotFoundMessage() {
  return (
    <section className="flex flex-1 items-center bg-white py-20">
      <div className="mx-auto max-w-xl px-4 text-center">
        <p className="eyebrow text-xs text-gold-600">404 NOT FOUND</p>
        <h1 className="mt-4 text-2xl text-navy-800 sm:text-3xl">ページが見つかりません</h1>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          お探しのページは、移動または削除されたか、URL が間違っている可能性があります。
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">トップへ戻る</ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            お問い合わせ
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
