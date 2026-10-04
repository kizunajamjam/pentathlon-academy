import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button-link";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "古代五種",
  description:
    "約2700年前の古代オリンピックで行われた「古代五種（ペンタスロン）」と、近代五種へつながる歴史をご紹介します。",
};

// 古代五種の紹介文（オーナー提供）。1段落 = 配列の1要素。
// 段落ごとに <p> を出すので、文面を直すときはここだけ触ればよい。
const EVENTS = ["走幅跳", "円盤投", "スタディオン走", "やり投", "レスリング"];

const SECTIONS: {
  id: string;
  eyebrow: string;
  title: string;
  body: string[];
  // 強調して別枠で出す結びの一文（任意）
  note?: string;
}[] = [
  {
    id: "run",
    eyebrow: "01 / RUN",
    title: "古代五種の「走る」",
    body: [
      "スタディオン走は、古代オリンピックで最も古く、最も象徴的な競技の一つでした。",
      "選手たちは、オリンピアの競技場を約1スタディオン、現在の距離でおよそ192m走りました。",
      "現在の陸上競技のように「何秒で走ったか」という記録を追うことよりも、誰よりも先にゴールすることそのものが重要でした。",
      "古代オリンピックでは、現代のような記録を競うのではなく、「誰が勝ったのか」が大きな意味を持っていたのです。",
    ],
  },
  {
    id: "jump",
    eyebrow: "02 / JUMP",
    title: "古代五種の「跳ぶ」",
    body: [
      "走幅跳は、現在の走幅跳とは少し違います。",
      "古代ギリシャでは、助走をつけた立ち幅跳びに近い形で行われ、選手は両手に「ハルテレス」と呼ばれる重りを持って跳んだとされています。",
      "この重りを振りながら跳躍することで、身体の動きを利用して距離を伸ばそうとしました。",
      "古代のアスリートたちは、ただ力任せに跳んでいたのではありません。身体の動き、タイミング、バランス。そうした技術も、跳躍の重要な要素だったのです。",
    ],
  },
  {
    id: "throw",
    eyebrow: "03 / THROW",
    title: "古代五種の「投げる」",
    body: [
      "円盤投とやり投も、古代五種を代表する競技です。",
      "円盤は、石や金属などで作られていました。やり投では木製の槍が使われ、革製のひもを利用して投げる方法も用いられていました。",
      "特に、やり投や円盤投のような投てき競技は、古代ギリシャの社会における「戦うための能力」とも結びついていました。",
      "走る、跳ぶ、投げる。こうした能力は、単なるスポーツのためだけではなく、当時の人々が必要としていた身体能力でもあったのです。",
    ],
  },
  {
    id: "wrestling",
    eyebrow: "04 / WRESTLING",
    title: "最後に待っていた「レスリング」",
    body: [
      "古代五種の最後を飾るのが、レスリングです。",
      "走る、跳ぶ、投げるという能力だけではありません。最後には、相手と直接向き合い、自分の身体を使って戦う。ここに古代五種の大きな特徴があります。",
      "スピード、跳躍力、投てき能力、そして格闘能力。一つの競技だけでは身につけることのできない、さまざまな能力が一人の選手に求められました。",
    ],
    note: "なお、古代五種全体の勝敗をどのように決めていたのかについては、現代の五種競技のように完全に明らかになっているわけではありません。古代の記録には不明な点も残されています。",
  },
];

export default function AncientPage() {
  return (
    <>
      <PageHero title="古代五種" titleEn="ANCIENT PENTATHLON" />

      {/* ── 導入 ───────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading
            eyebrow="ANCIENT PENTATHLON"
            title="五つの競技に挑んだ古代のアスリート"
          />
          <div className="mt-8 space-y-4 text-sm leading-[1.9] text-muted sm:text-base">
            <p>今から約2700年前。</p>
            <p>
              古代ギリシャのオリンピアでは、神々に捧げる祭典として、古代オリンピックが行われていました。
            </p>
            <p>
              その中で、紀元前708年に登場したのが「古代五種（ペンタスロン）」です。「ペンタスロン」という言葉は、「五つの競技」を意味します。
            </p>
            <p>古代五種は、次の性質の異なる5つの競技で構成されていました。</p>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {EVENTS.map((e, i) => (
              <li
                key={e}
                className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-navy-800"
              >
                <span className="font-display text-xs font-bold text-gold-700">{i + 1}</span>
                {e}
              </li>
            ))}
          </ul>

          <h3 className="mt-14 text-xl text-navy-800">走る、跳ぶ、投げる、そして戦う</h3>
          <div className="mt-5 space-y-4 text-sm leading-[1.9] text-muted sm:text-base">
            <p>
              古代五種の大きな特徴は、単純に同じ種類の能力を競う競技ではなかったことです。走る。跳ぶ。投げる。そして、相手と組み合って戦う。
            </p>
            <p>
              それぞれに求められる能力が異なる5つの競技に、一人の選手が挑みました。
            </p>
            <p>
              現在のスポーツのように、細かく専門化された競技とは違い、古代のアスリートには、さまざまな身体能力を一人で発揮することが求められていたのです。
            </p>
          </div>
        </div>
      </section>

      {/* ── 各競技 ─────────────────────────────────────────────────── */}
      {SECTIONS.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={`scroll-mt-20 py-14 sm:py-20 ${i % 2 === 0 ? "bg-surface" : "bg-white"}`}
        >
          <div className="mx-auto max-w-3xl px-4">
            <p className="eyebrow text-[10px] text-muted">{s.eyebrow}</p>
            <h2 className="mt-2 text-2xl text-navy-800">{s.title}</h2>
            <span className="mt-4 block h-0.5 w-12 bg-gold-500" />
            <div className="mt-6 space-y-4 text-sm leading-[1.9] text-muted sm:text-base">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {s.note && (
              <p className="mt-6 rounded-card border border-border bg-white px-5 py-4 text-sm leading-relaxed text-navy-700">
                {s.note}
              </p>
            )}
          </div>
        </section>
      ))}

      {/* ── 最も優れたアスリート ───────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading eyebrow="THE ALL-ROUND ATHLETE" title="「最も優れたアスリート」とは" />
          <div className="mt-8 space-y-4 text-sm leading-[1.9] text-muted sm:text-base">
            <p>
              古代五種が興味深いのは、そこに「一つの能力だけではない強さ」という考え方が見えることです。
            </p>
            <p>
              最も速いだけではない。最も遠くへ跳ぶだけでもない。最も遠くへ投げるだけでもない。そして、最も強いだけでもない。
            </p>
            <p>走る、跳ぶ、投げる、戦う。</p>
            <p>
              異なる能力を一人の身体に備え、それらを競技の中で発揮する。古代五種は、そんな総合的な身体能力を持つアスリートを象徴する競技だったと考えられます。
            </p>
          </div>
        </div>
      </section>

      {/* ── クーベルタン ───────────────────────────────────────────── */}
      <section className="bg-navy-800 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading
            eyebrow="TO COUBERTIN"
            title="そして、クーベルタンへ"
            tone="light"
          />
          <div className="mt-8 space-y-4 text-sm leading-[1.9] text-navy-200 sm:text-base">
            <p>
              時代は大きく変わり、古代オリンピックは長い歴史の中で姿を消しました。しかし、その精神に魅せられた人物がいました。近代オリンピックの創設者、ピエール・ド・クーベルタンです。
            </p>
            <p>
              クーベルタン男爵は古代オリンピックの競技や精神に強い関心を持ち、その中でも古代五種のような「総合的な能力を持つアスリート」という考え方に着目しました。
            </p>
            <p>
              そして1912年。ストックホルム大会で、クーベルタン男爵が考案した「近代五種」がオリンピック競技として登場します。IOCの資料でも、クーベルタン男爵が近代五種を「オリンピック選手の総合的な身体・精神能力を試す競技」として構想したことが紹介されています。
            </p>
            <p className="font-display text-base text-white sm:text-lg">
              古代ギリシャで始まった「五つの競技に挑む」という考え方は、時代を越えて、新たな五種競技へと受け継がれていったのです。
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/disciplines">近代五種のトレーニング内容</ButtonLink>
            <ButtonLink href="/contact" variant="ghost">
              お問い合わせ
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
