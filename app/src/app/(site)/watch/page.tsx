import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import { DisciplineIcon } from "@/components/icons/discipline-icons";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import type { DisciplineId } from "@/types";

export const metadata: Metadata = {
  title: "観戦ガイド",
  description:
    "近代五種を観戦する方へ。各種目の得点のしくみと、フェンシングで使われるフランス語の号令をご紹介します。",
};

const RULES_URL =
  "https://www.uipmworld.org/sites/default/files/uipm_competition_rules_and_equipment_regulations_7.pdf";

/*
 * 得点表。UIPM 競技規則（2026年2月1日版）のシニア個人の基準から作っている。
 *   フェンシング: 2.5 / Appendix 2B1（勝率70%で250点。1勝の点数は出場人数で変わる）
 *   オブスタクル: 3.6 / Appendix 3B1（15秒00で400点、0.33秒ごとに1点）
 *   水泳:         4.5.2（1分10秒00で250点、0.2秒ごとに1点）
 *   レーザーラン: 5.5（13分20秒で500点、1秒ごとに1点）
 * 例の行は上の式から計算した値（オブスタクルは Appendix 3B1 の表と照合済み）。
 *
 * フェンシングのボーナスラウンドは、競技紹介ページと同じ方針で載せていない。
 */
const SCORING: {
  id: DisciplineId | "laserrun";
  icon: DisciplineId;
  name: string;
  event: string;
  basis: string;
  head: [string, string];
  rows: [string, string][];
  note?: string;
}[] = [
  {
    id: "fencing",
    icon: "fencing",
    name: "フェンシング",
    event: "エペ・1本勝負の総当たり戦",
    basis: "全試合の70%に勝つと250点。1勝あたりの点数は出場人数によって変わります。",
    head: ["勝ち数", "得点"],
    rows: [
      ["30勝", "275点"],
      ["28勝", "265点"],
      ["25勝", "250点"],
      ["22勝", "235点"],
      ["20勝", "225点"],
    ],
    note: "例は36人が出場した場合（1人35試合・1勝＝5点）。",
  },
  {
    id: "obstacle",
    icon: "obstacle",
    name: "オブスタクル",
    event: "障害物コース",
    basis: "15秒00で400点。そこから0.33秒遅くなるごとに1点ずつ減ります。",
    head: ["タイム", "得点"],
    rows: [
      ["15秒00", "400点"],
      ["20秒00", "385点"],
      ["25秒00", "370点"],
      ["30秒00", "355点"],
      ["40秒00", "325点"],
    ],
  },
  {
    id: "swimming",
    icon: "swimming",
    name: "水泳",
    event: "100m自由形",
    basis: "1分10秒00で250点。0.2秒速いごとに1点増え、遅いごとに1点減ります。",
    head: ["タイム", "得点"],
    rows: [
      ["55秒00", "325点"],
      ["1分00秒00", "300点"],
      ["1分05秒00", "275点"],
      ["1分10秒00", "250点"],
      ["1分15秒00", "225点"],
    ],
  },
  {
    id: "laserrun",
    icon: "shooting",
    name: "レーザーラン",
    event: "射撃とランニングを交互に行う3000m",
    basis: "13分20秒で500点。1秒速いごとに1点増え、遅いごとに1点減ります。",
    head: ["タイム", "得点"],
    rows: [
      ["11分40秒", "600点"],
      ["12分30秒", "550点"],
      ["13分20秒", "500点"],
      ["14分10秒", "450点"],
      ["15分00秒", "400点"],
    ],
  },
];

// 観戦に必要な号令だけに絞っている（レッスンで使う技術用語は載せない）。
const TERMS: { fr: string; kana: string; meaning: string }[] = [
  { fr: "En garde", kana: "アン・ガルド", meaning: "構え" },
  { fr: "Êtes-vous prêts ?", kana: "エト・ヴ・プレ", meaning: "準備はいいですか" },
  { fr: "Allez", kana: "アレ", meaning: "始め" },
  { fr: "Halte", kana: "アルト", meaning: "止め" },
  { fr: "Touche", kana: "トゥーシュ", meaning: "有効な突き" },
  {
    fr: "Coup double",
    kana: "クー・ドゥブル",
    meaning: "同時突き。総当たり戦では取り消してやり直します",
  },
];

export default function WatchPage() {
  return (
    <>
      <PageHero title="観戦ガイド" titleEn="WATCH" />

      {/* ── 得点のしくみ ───────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="SCORING"
            title="得点のしくみ"
            description={
              "近代五種は、各種目の成績を点数に換えて、その合計で順位を決めます。\n最終種目のレーザーランは、それまでの得点差がそのままスタートの時間差になります（1点＝1秒）。そのため、最初にゴールした選手が優勝です。"
            }
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {SCORING.map((s) => (
              <div key={s.id} className="min-w-0 rounded-card border border-border bg-white p-6">
                <div className="flex items-center gap-3">
                  <DisciplineIcon id={s.icon} className="h-10 w-10 shrink-0 object-contain" />
                  <div>
                    <h3 className="text-lg text-navy-800">{s.name}</h3>
                    <p className="text-xs text-muted">{s.event}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-navy-700">{s.basis}</p>
                <table className="mt-4 w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 text-left font-normal text-muted">{s.head[0]}</th>
                      <th className="py-2 text-right font-normal text-muted">{s.head[1]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.rows.map(([a, b]) => (
                      <tr key={a} className="border-b border-border">
                        <td className="py-2 font-display tabular-nums text-navy-800">{a}</td>
                        <td className="py-2 text-right font-display font-bold tabular-nums text-navy-800">
                          {b}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {s.note && <p className="mt-3 text-xs leading-relaxed text-muted">{s.note}</p>}
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-muted">
            シニア（個人）の基準です。年代や大会の形式によって距離や基準は変わります。出典：
            <a
              href={RULES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-flex items-center gap-1 font-bold text-navy-800 underline decoration-gold-400 underline-offset-4 transition-colors hover:text-gold-600"
            >
              UIPM 競技規則（2026年2月1日版）
              <ExternalLink size={12} className="shrink-0" />
            </a>
          </p>
        </div>
      </section>

      {/* ── フランス語 ─────────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading eyebrow="LANGUAGE" title="会場で聞こえるフランス語" />
          <div className="mt-8 space-y-4 text-sm leading-[1.9] text-muted sm:text-base">
            <p>
              近代五種を考案したのは、近代オリンピックの父として知られるフランス人、ピエール・ド・クーベルタンです。
            </p>
            <p>
              国際オリンピック委員会（IOC）の公用語は、フランス語と英語です。両者の内容が食い違うときは、フランス語が優先されます。
            </p>
            <p>フェンシングの試合では、審判の号令にフランス語が使われます。</p>
            <p>
              「Allez（アレ）」「Halte（アルト）」など、試合中に耳にする言葉には、それぞれ意味があります。
            </p>
            <p>
              号令の意味を知ることで、試合の流れや審判の進行がわかり、競技への理解も深まります。
            </p>
            <p>
              ここでは、フェンシングの試合でよく使われるフランス語の号令と、その意味を解説します。
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-card border border-border bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-navy-50">
                  <th className="w-[45%] px-4 py-3 text-left font-bold text-navy-800">号令（読み）</th>
                  <th className="px-4 py-3 text-left font-bold text-navy-800">意味</th>
                </tr>
              </thead>
              <tbody>
                {TERMS.map((t) => (
                  <tr key={t.fr} className="border-b border-border last:border-b-0">
                    {/* スマホで3列だと読みが細切れに折り返すため、号令と読みを1つのセルにまとめる */}
                    <td className="px-4 py-3 align-top">
                      <span className="block font-display font-bold text-navy-800" lang="fr">
                        {t.fr}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">{t.kana}</span>
                    </td>
                    <td className="px-4 py-3 align-top text-navy-700">{t.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-navy-700">
            近代五種のフェンシングは、1分間の1本勝負です。時間内にどちらも突けなかった場合は、両者とも負けになります。
          </p>
          <p className="mt-4 rounded-card border border-border bg-white px-5 py-4 text-sm leading-relaxed text-navy-700 sm:px-6">
            ここに載せたのは、観戦に必要な言葉だけです。選手のレッスンでは、ファント（突きの踏み込み）、パラード（相手の攻撃を剣で払って防ぐ動作）、リポスト（パラードの直後に返す攻撃）など、ほかにもたくさんのフランス語を使います。
          </p>
        </div>
      </section>

      <section className="bg-navy-800 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <SectionHeading
            eyebrow="CONTACT"
            title="大会を見に行ってみませんか。"
            description={"観戦できる大会は、\n大会・イベントのページでご案内しています。"}
            tone="light"
            align="center"
            descriptionAlign="left"
          />
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/events">大会・イベント</ButtonLink>
            <ButtonLink href="/disciplines" variant="ghost">
              競技について知る
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
