import { Coins, MapPin, Sprout } from "lucide-react";

import { DisciplineExplorer } from "@/components/discipline-explorer";
import { PentagonMotif } from "@/components/layout/site-logo";
import { ButtonLink } from "@/components/ui/button-link";
import { EventCard } from "@/components/ui/event-card";
import { NewsRow } from "@/components/ui/news-row";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { SectionHeading } from "@/components/ui/section-heading";
import { SHOW_PLACEHOLDERS, SITE } from "@/lib/constants/site";
import { listUpcomingEvents } from "@/lib/db/events";
import { listPublishedNews } from "@/lib/db/news";

/*
 * はじめての方が最初に知りたいこと。ヒーローのすぐ下に並べる（オーナー確認済み）。
 * 年齢・未経験: 年齢は問わず、どの種目も未経験でよい。
 * 費用: 月会費・指導料なし、実費のみ（クラブ規約 第5条〜第7条）。
 * 地域: 練習場所は大阪府・兵庫県（練習スケジュール参照）。
 */
const FIRST_POINTS = [
  {
    icon: Sprout,
    title: "未経験から始められます",
    body: "近代五種もどの種目も初めての方を歓迎します。年齢は問いません。大人の方もどうぞ。",
  },
  {
    icon: Coins,
    title: "月会費・指導料はいただきません",
    body: "ご負担いただくのは、施設利用料や大会参加費などの実費だけです。",
  },
  {
    icon: MapPin,
    title: "大阪・兵庫で活動しています",
    body: "曜日ごとに種目と場所が変わります。参加する日はご相談のうえ決めます。",
  },
];

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
              語の途中に入る。文節ごとに inline-block で包むと、どのブラウザでも
              この単位でしか折れない。「近代五種を通じて、」で必ず改行し、
              狭い画面では残りが「人生を切り拓く / 総合力を育む」で折れる。
            */}
            <h1 className="mt-5 text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
              <span className="inline-block">近代五種を通じて、</span>
              <br />
              <span className="inline-block">人生を切り拓く</span>
              <span className="inline-block">総合力を育む</span>
            </h1>
            {/* 総合力の中身。キャッチコピーとセットで出すようオーナー指定。 */}
            <ul className="mt-7 flex flex-wrap gap-2.5">
              {["挑戦する力", "考える力", "やり抜く力"].map((power) => (
                <li
                  key={power}
                  className="whitespace-nowrap rounded-full border border-gold-400/60 px-4 py-1.5 font-display text-sm font-bold text-gold-400"
                >
                  {power}
                </li>
              ))}
            </ul>
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

      {/* ── はじめての方へ ─────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-navy-900">
        <ul className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:py-12 md:grid-cols-3">
          {FIRST_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <li key={point.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-400/50">
                  <Icon size={20} className="text-gold-400" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-white">{point.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-200">{point.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── 五種競技 ───────────────────────────────────────────────── */}
      {/* ロゴは黒地の発光デザインなので、ロゴの背景と同じ黒にして切り出しの境目を見せない */}
      <section className="bg-black py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="eyebrow text-xs text-gold-400">DISCIPLINES</p>
            <h2 className="mt-3 text-2xl text-white sm:text-3xl">近代五種という競技</h2>
            <span className="mx-auto mt-4 block h-0.5 w-12 bg-gold-500" />
          </div>

          <div className="mt-12">
            <DisciplineExplorer />
          </div>
        </div>
      </section>

      {/* ── アカデミー紹介 ─────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-24">
        <div
          className={`mx-auto grid gap-12 px-4 lg:items-center ${
            SHOW_PLACEHOLDERS ? "max-w-6xl lg:grid-cols-2" : "max-w-3xl"
          }`}
        >
          {SHOW_PLACEHOLDERS && <PhotoSlot label="練習風景の写真が入ります（横長 4:3 推奨）" />}
          <div>
            <SectionHeading
              eyebrow="ABOUT"
              title="5種目を鍛えられる場所を。"
              description="近代五種は5つの種目それぞれに場所と道具を必要とするため、まとめて取り組める環境はなかなかありません。ペンタスロンアカデミーは、その環境をつくるために立ち上げました。"
            />
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              突く・登る・泳ぐ・撃つ・走る。性質のまったく違う5種目に取り組むことで、挑戦する力・考える力・やり抜く力を育てていきます。練習は個別・グループのどちらにも対応します。
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
      {/* 最新4件だけを出す。それより前のものは /news の一覧から辿れる */}
      <section id="news" className="scroll-mt-20 bg-white py-16 sm:py-24 lg:scroll-mt-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading eyebrow="NEWS" title="お知らせ" />
          <div className="mt-8">
            {news.length > 0 ? (
              news.map((n) => <NewsRow key={n.id} news={n} />)
            ) : (
              <p className="py-8 text-sm text-muted">お知らせはまだありません。</p>
            )}
          </div>
          {news.length > 0 && (
            <div className="mt-8">
              <ButtonLink href="/news" variant="outline">
                お知らせ一覧
              </ButtonLink>
            </div>
          )}
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
            description={"体験・見学は随時受け付けています。\n水泳や陸上など、これまで続けてきた競技があれば、それがそのまま武器になります。\n近代五種が初めての方も歓迎します。"}
            tone="light"
            align="center"
            descriptionAlign="left"
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
