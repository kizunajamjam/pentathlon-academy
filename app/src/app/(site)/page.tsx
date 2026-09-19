import { DisciplineExplorer } from "@/components/discipline-explorer";
import { PentagonMotif } from "@/components/layout/site-logo";
import { ButtonLink } from "@/components/ui/button-link";
import { EventCard } from "@/components/ui/event-card";
import { NewsRow } from "@/components/ui/news-row";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/constants/site";
import { listUpcomingEvents } from "@/lib/db/events";
import { listPublishedNews } from "@/lib/db/news";

export default async function HomePage() {
  const [news, events] = await Promise.all([listPublishedNews(4), listUpcomingEvents(2)]);

  return (
    <>
      {/* ── ヒーロー ───────────────────────────────────────────────── */}
      {/*
        ロゴはヘッダーに常時出ているうえ、すぐ下の DISCIPLINES で
        五角形そのものを大きく使うため、ヒーローには置かない。
        見出しだけの1段組みにしている。
      */}
      <section className="relative overflow-hidden bg-navy-800">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow text-xs text-gold-400">MODERN PENTATHLON</p>
            {/*
              iOS Safari は word-break: auto-phrase に未対応で、折り返しが
              「…クラ / ブ。」のように語の途中に入る。文節ごとに
              inline-block で包むと、どのブラウザでもこの単位でしか折れない。
              9文字ずつに割れるので、どの画面幅でも2行で釣り合う。
            */}
            <h1 className="mt-5 text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
              <span className="inline-block">近代五種に、本気で</span>
              <span className="inline-block">取り組めるクラブ。</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-navy-200 sm:text-base">
              {SITE.description}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/contact">体験のお申し込み</ButtonLink>
              <ButtonLink href="/about" variant="ghost">
                アカデミーについて
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── 五種競技 ───────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="eyebrow text-xs text-gold-600">DISCIPLINES</p>
            <h2 className="mt-3 text-2xl text-navy-800 sm:text-3xl">近代五種という競技</h2>
            <span className="mx-auto mt-4 block h-0.5 w-12 bg-gold-500" />
          </div>

          <div className="mt-12">
            <DisciplineExplorer />
          </div>
        </div>
      </section>

      {/* ── アカデミー紹介 ─────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
          <PhotoSlot label="練習風景の写真が入ります（横長 4:3 推奨）" />
          <div>
            <SectionHeading
              eyebrow="ABOUT"
              title="5種目を鍛えられる場所を。"
              description="近代五種は5つの種目それぞれに場所と道具を必要とするため、まとめて取り組める環境はなかなかありません。ペンタスロンアカデミーは、その環境をつくるために立ち上げました。"
            />
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              突く・登る・泳ぐ・撃つ・走る。5種目を一貫して積み上げ、日本代表、そしてオリンピックの舞台で戦える選手を育てることを目標にしています。練習は個別・グループのどちらにも対応します。
            </p>
            <div className="mt-8">
              <ButtonLink href="/about" variant="outline">
                アカデミーについて
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── お知らせ ───────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading eyebrow="NEWS" title="お知らせ" />
          <div className="mt-8">
            {news.length > 0 ? (
              news.map((n) => <NewsRow key={n.id} news={n} />)
            ) : (
              <p className="py-8 text-sm text-muted">お知らせはまだありません。</p>
            )}
          </div>
          <div className="mt-8">
            <ButtonLink href="/news" variant="outline">
              お知らせ一覧
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── 大会・イベント ─────────────────────────────────────────── */}
      {events.length > 0 && (
        <section className="bg-surface py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <SectionHeading eyebrow="EVENTS" title="近日開催の予定" />
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
            <div className="mt-8">
              <ButtonLink href="/events" variant="outline">
                大会・イベント一覧
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-800 py-16 sm:py-20">
        <PentagonMotif className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 opacity-10" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <SectionHeading
            eyebrow="CONTACT"
            title="まずは練習を見に来て下さい。"
            description="体験・見学は随時受け付けています。水泳や陸上など、これまで続けてきた競技があれば、それがそのまま武器になります。近代五種が初めての方もご相談ください。"
            tone="light"
            align="center"
          />
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact">お問い合わせ</ButtonLink>
            <ButtonLink href="/schedule" variant="ghost">
              練習スケジュール
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
