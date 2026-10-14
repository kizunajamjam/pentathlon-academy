import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { assetPath } from "@/lib/utils/asset";

export const metadata: Metadata = {
  title: "平和教育",
  description:
    "オリンピックの歴史や理念、古代オリンピックの「エケケイリア（聖なる休戦）」から、スポーツを通して平和な世界をつくるために私たちにできることを考えます。",
};

/*
 * 平和教育のページ。文面はオーナー提供。1段落 = 配列の1要素。
 * 文面を直すときは、この上のほうの定数だけ触ればよい。
 */

const INTRO = [
  "「近代オリンピックの父」と呼ばれているのは、19世紀のフランスの教育者、ピエール・ド・クーベルタン男爵です。",
  "クーベルタンは、教育について深く考えるなかで、スポーツが青少年の健全な成長を支え、人間としての豊かな心を育む力をもっていることに着目しました。そして、スポーツを通して世界の人々が互いを理解し、友情を深め、平和な社会を築くことを目指して、古代オリンピックの復興を呼びかけました。",
  "1894年6月23日、パリで近代オリンピックの開催と国際オリンピック委員会（IOC）の設立が決まりました。この日を記念して、毎年6月23日は「オリンピックデー」とされています。",
  "オリンピックは、単に競技の勝敗や記録を競う大会ではありません。国籍、言語、文化、宗教、生活習慣などの違いを越えて、人々が出会い、互いを認め合う機会でもあります。スポーツを通して相手を尊重し、努力をたたえ合い、違いを理解しようとする姿勢は、平和な世界を築くための大切な土台となります。",
  "私たちは、オリンピックの歴史や理念を学びながら、平和とは何か、そして自分たちに何ができるのかを考えていきます。",
];

const SECTIONS: {
  id: string;
  eyebrow: string;
  title: string;
  body: string[];
}[] = [
  {
    id: "ekecheiria",
    eyebrow: "EKECHEIRIA",
    title: "エケケイリア ― 古代オリンピックに込められた平和への願い",
    body: [
      "古代ギリシャのオリンピックには、「エケケイリア（Ekecheiria）」と呼ばれる聖なる休戦の伝統がありました。",
      "古代ギリシャでは、都市国家同士が争うことも少なくありませんでした。そのような時代に、オリンピックに参加する選手や観客が安全に開催地へ向かい、競技を終えて帰ることができるよう、競技の前後に休戦を呼びかける伝統が生まれました。",
      "エケケイリアは、争いの続く世界においても、人々が集い、競い合い、互いを認め合うための平和な時間と場所を守ろうとする考え方でした。",
      "もちろん、休戦によってすべての争いがなくなったわけではありません。しかし、対立する人々であっても、共通の目的のもとに集い、相手と向き合うことができるという考え方には、現代にも通じる大切な意味があります。",
      "現在のオリンピック・ムーブメントでも、この伝統を受け継ぐ「オリンピック休戦」が平和への取り組みとして位置づけられています。国際オリンピック委員会は1992年に休戦の伝統を改めて呼びかけ、国際連合も1993年以降、オリンピック休戦に関する決議を採択してきました。",
      "スポーツだけですべての戦争や紛争を解決することはできません。それでも、対話の機会をつくり、異なる立場の人々が出会い、互いを理解しようとすることには大きな意義があります。",
      "エケケイリアの歴史から、私たちは「争いをなくすために、まず相手と向き合うこと」の大切さを学ぶことができます。",
    ],
  },
  {
    id: "olympic-day",
    eyebrow: "OLYMPIC DAY",
    title: "オリンピックデー ― オリンピックの理念を日常へ",
    body: [
      "毎年6月23日のオリンピックデーは、近代オリンピックの誕生を振り返り、スポーツの楽しさや教育的な価値を考える機会です。",
      "オリンピックデーの意義は、競技に参加したり、スポーツに親しんだりすることだけではありません。スポーツを通して、自分自身や他者、そして社会との関わり方を見つめ直すことにもあります。",
      "例えば、勝敗にかかわらず相手の努力をたたえること、ルールを守って公平に行動すること、仲間の得意なことや苦手なことを認め合うこと。こうした経験は、学校生活や地域社会のなかでも生かすことができます。",
      "平和は、遠い国で起きている出来事や、国際社会だけが取り組む課題ではありません。自分と異なる考え方をもつ人の話を聞くこと、困っている人に手を差し伸べること、意見が対立したときに相手を否定するのではなく対話を続けることも、平和をつくる行動の一つです。",
      "オリンピックデーをきっかけに、スポーツを通して学んだことを日々の生活につなげていきましょう。",
    ],
  },
];

const EDUCATION_INTRO = [
  "オリンピック教育は、オリンピックの歴史や競技について学ぶだけのものではありません。スポーツを通して、人間としての成長や社会との関わり方を学び、よりよい世界を築くための力を育む教育です。",
  "日本オリンピック委員会（JOC）が紹介するオリンピックの教育的価値には、努力から得られる喜び、フェアプレー、他者への敬意、向上心、体と頭と心のバランスがあります。",
  "これらの価値を、平和教育の視点から考えてみましょう。",
];

const VALUES: { title: string; body: string[] }[] = [
  {
    title: "他者理解 ― 違いを知り、認め合う",
    body: [
      "私たちは、一人ひとり異なる文化や価値観、経験をもっています。自分にとって当たり前のことが、ほかの人にとっても当たり前とは限りません。",
      "オリンピックには、さまざまな国や地域から選手が集まります。競技だけでなく、それぞれの背景や生き方に目を向けることで、世界には多様な考え方や文化があることを知ることができます。",
      "他者を理解するためには、自分の考えだけを基準に判断せず、相手の話に耳を傾けることが重要です。違いをなくすのではなく、違いがあることを認め、その理由を知ろうとすることが相互理解の第一歩です。",
    ],
  },
  {
    title: "共感 ― 相手の立場に立って考える",
    body: [
      "共感とは、相手が何を感じ、どのようなことを考えているのかを想像し、理解しようとすることです。",
      "競技で敗れた選手の悔しさ、困難を乗り越えた選手の喜び、仲間を支える人々の思い。それらに目を向けることで、自分とは異なる立場にある人の気持ちを考えるきっかけが生まれます。",
      "日常生活でも、友人が困っているときに声をかける、意見の違う相手の話を最後まで聞く、誰かが仲間外れにされているときに行動するなど、共感を具体的な行動につなげることが大切です。",
      "相手の気持ちを完全に理解することは難しくても、理解しようと努力することはできます。その姿勢が、人と人との信頼関係を築きます。",
    ],
  },
  {
    title: "尊重とフェアプレー ― 相手を大切にする",
    body: [
      "フェアプレーとは、ルールを守り、公平に競技に取り組むことだけではありません。相手を尊重し、勝利のために何をしてもよいという考え方をしないことも含まれます。",
      "自分の意見を大切にするのと同じように、相手の意見にも耳を傾ける。失敗した人を責めるのではなく、再び挑戦できるよう支える。立場の弱い人や少数派の人も安心して参加できる環境をつくる。",
      "こうした行動は、スポーツの場面に限らず、誰もが安心して生活できる社会をつくるために必要です。",
    ],
  },
  {
    title: "対話と協力 ― 対立を乗り越える",
    body: [
      "人と人が関わるなかでは、意見が食い違ったり、考え方の違いから対立したりすることがあります。大切なのは、対立そのものを避けることではなく、相手を傷つけたり排除したりすることなく、解決に向けて話し合うことです。",
      "スポーツでは、チームの仲間と意見を出し合い、役割を分担し、共通の目標に向かって協力します。そこから、互いの強みを生かすことや、自分とは異なる考え方を受け入れることを学べます。",
      "異なる意見をもつ人同士が対話を重ね、共通点を見つけ、協力できる方法を探すこと。それは、平和な社会を築くうえでも重要な力です。",
    ],
  },
  {
    title: "努力と向上心 ― 自分にできることを続ける",
    body: [
      "平和な社会を実現するためには、国や国際機関の取り組みだけでなく、一人ひとりが身近な課題に向き合うことも必要です。",
      "すぐに大きな変化を起こせなくても、相手の話を丁寧に聞く、偏見に気づいたら見直す、困っている人を支えるといった行動を続けることはできます。",
      "スポーツで目標に向かって努力するように、よりよい人間関係や社会を築くためにも、学び、振り返り、行動を改善していくことが大切です。",
    ],
  },
];

const ACTIONS: { title: string; items: string[] }[] = [
  {
    title: "学校でできること",
    items: [
      "自分と異なる意見をもつ人の話を、最後まで聞く。",
      "友人の得意なことや苦手なことを認め、互いに支え合う。",
      "いじめや仲間外れを見過ごさず、周囲の大人に相談する。",
      "話し合いでは、相手を否定するのではなく、理由を尋ねて理解しようとする。",
    ],
  },
  {
    title: "スポーツを通してできること",
    items: [
      "勝敗にかかわらず、相手の努力をたたえる。",
      "ルールを守り、公平な態度で競技に取り組む。",
      "年齢、性別、障がい、国籍、経験の違いにかかわらず、誰もが参加しやすい環境をつくる。",
      "チームの仲間と協力し、一人ひとりの力を生かす。",
    ],
  },
  {
    title: "世界とのつながりのなかでできること",
    items: [
      "世界のさまざまな地域の文化や歴史について学ぶ。",
      "国際的な出来事について、複数の信頼できる情報源を確認する。",
      "自分とは異なる文化や価値観に出会ったとき、決めつけずに背景を知ろうとする。",
      "国際交流や地域の活動に参加し、異なる背景をもつ人々と対話する。",
    ],
  },
];

// 参考資料。リンク先は 2026年10月に開けることを確認済み。
const RESOURCES: {
  org: string;
  links: { label: string; href: string; note: string }[];
}[] = [
  {
    org: "日本オリンピック委員会（JOC）",
    links: [
      {
        label: "クーベルタンとオリンピズム",
        href: "https://www.joc.or.jp/olympism/history/coubertin/",
        note: "近代オリンピックの誕生と、クーベルタンが未来に託した理念について学べます。",
      },
      {
        label: "オリンピックの価値",
        href: "https://www.joc.or.jp/olympism/principles/value/",
        note: "努力、フェアプレー、他者への敬意など、オリンピック教育の基礎となる価値を確認できます。",
      },
      {
        label: "学ぶ・体験する",
        href: "https://www.joc.or.jp/olympism/experience/",
        note: "オリンピック価値教育プログラム（OVEP）の教材や、ミュージアムでの学習機会を探せます。",
      },
      {
        label: "オリンピック価値教育プログラム（OVEP）活動教材",
        href: "https://www.joc.or.jp/olympism/ovep/pdf/ovep2017_activity.pdf",
        note: "オリンピックの価値を具体的な活動やワークを通して学ぶための教材です。",
      },
    ],
  },
  {
    org: "国際オリンピック委員会（IOC）",
    links: [
      {
        label: "Olympic Values Education Programme（OVEP）教材・資料",
        href: "https://www.olympics.com/ioc/education/olympic-values-education-programme",
        note: "スポーツと教育を結びつけ、オリンピックの価値を学ぶための国際的な教育資料を探せます。",
      },
    ],
  },
  {
    org: "国際連合（国連）",
    links: [
      {
        label: "The United Nations and the Olympic Truce（国連とオリンピック休戦）",
        href: "https://www.un.org/en/olympictruce",
        note: "古代のエケケイリアから現代のオリンピック休戦まで、スポーツと平和の関係について学べます。",
      },
    ],
  },
];

const TEXT = "space-y-4 text-sm leading-[1.9] text-muted sm:text-base";

export default function PeacePage() {
  return (
    <>
      <PageHero title="平和教育" titleEn="PEACE EDUCATION" />

      {/* ── 導入 ───────────────────────────────────────────────────── */}
      {/* 鳩付きのロゴは黒地の発光デザインなので、背景も黒にして境目を見せない */}
      <section className="bg-black py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Image
            src={assetPath("/photos/peace-logo.jpg")}
            alt="オリーブの枝をくわえた鳩と、ペンタスロンアカデミーのロゴ"
            width={1000}
            height={938}
            className="mx-auto w-full max-w-sm"
          />
          <h2 className="mt-8 text-[clamp(1.25rem,5.6vw,1.875rem)] leading-snug text-white">
            オリンピックから考える、
            <br />
            平和な世界のつくり方
          </h2>
          <span className="mx-auto mt-5 block h-0.5 w-12 bg-gold-500" />
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading eyebrow="SPORT & THE WORLD" title="スポーツを通して、世界とつながる" />
          <div className={`mt-8 ${TEXT}`}>
            {INTRO.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── エケケイリア / オリンピックデー ────────────────────────── */}
      {SECTIONS.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={`scroll-mt-20 py-16 sm:py-24 ${i % 2 === 0 ? "bg-surface" : "bg-white"}`}
        >
          <div className="mx-auto max-w-3xl px-4">
            <SectionHeading eyebrow={s.eyebrow} title={s.title} />
            <div className={`mt-8 ${TEXT}`}>
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── オリンピック教育が育む力 ───────────────────────────────── */}
      <section id="education" className="scroll-mt-20 bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading
            eyebrow="OLYMPIC EDUCATION"
            title="オリンピック教育が育む、平和につながる力"
          />
          <div className={`mt-8 ${TEXT}`}>
            {EDUCATION_INTRO.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <ol className="mt-10 space-y-6">
            {VALUES.map((v, i) => (
              <li key={v.title} className="rounded-card border border-border bg-white px-5 py-6 sm:px-7">
                <h3 className="flex items-baseline gap-3 text-lg text-navy-800">
                  <span className="font-display text-sm font-bold text-gold-700">{i + 1}</span>
                  {v.title}
                </h3>
                <div className={`mt-4 ${TEXT}`}>
                  {v.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 私たちにできること ─────────────────────────────────────── */}
      <section id="action" className="scroll-mt-20 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading eyebrow="ACTION" title="私たちにできること ― 身近な行動から平和をつくる" />
          <div className={`mt-8 ${TEXT}`}>
            <p>平和は、誰かが与えてくれるものではなく、私たち一人ひとりの行動によって支えられるものです。</p>
            <p>オリンピックの理念や平和教育で学んだことを、日常生活のなかで実践してみましょう。</p>
          </div>

          <div className="mt-10 space-y-8">
            {ACTIONS.map((a) => (
              <div key={a.title}>
                <h3 className="text-lg text-navy-800">{a.title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted sm:text-base">
                  {a.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-10 rounded-card border border-border bg-surface px-5 py-4 text-sm leading-relaxed text-navy-700 sm:text-base">
            小さな行動であっても、相手を尊重し、理解しようとする姿勢を積み重ねることが、平和な社会を築く力になります。
          </p>
        </div>
      </section>

      {/* ── さらに学ぶために ───────────────────────────────────────── */}
      <section id="resources" className="scroll-mt-20 bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading eyebrow="RESOURCES" title="オリンピック教育をさらに学ぶために" />
          <p className={`mt-8 ${TEXT}`}>
            オリンピックの歴史や価値、平和教育に関する理解を深めるために、以下の公式ウェブサイトや教材を活用できます。
          </p>

          <div className="mt-10 space-y-8">
            {RESOURCES.map((r) => (
              <div key={r.org}>
                <h3 className="text-lg text-navy-800">{r.org}</h3>
                <ul className="mt-4 space-y-3">
                  {r.links.map((l) => (
                    <li key={l.href} className="rounded-card border border-border bg-white px-5 py-4">
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-1.5 text-sm font-bold text-navy-800 underline decoration-gold-500 underline-offset-4 transition-colors hover:text-gold-700 sm:text-base"
                      >
                        {l.label}
                        <ExternalLink size={14} className="mt-1 shrink-0" />
                      </a>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{l.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className={`mt-10 ${TEXT}`}>
            これらの資料を活用し、オリンピックの歴史を知ることから、平和のために自分たちができることを考える学習へとつなげていきましょう。
          </p>
        </div>
      </section>

      {/* ── 結び ───────────────────────────────────────────────────── */}
      <section className="bg-navy-800 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading eyebrow="FROM SPORT TO PEACE" title="スポーツから平和へ、学びから行動へ" tone="light" />
          <div className="mt-8 space-y-4 text-sm leading-[1.9] text-navy-200 sm:text-base">
            <p>
              クーベルタンが目指したのは、スポーツを通して青少年を育て、世界の人々が互いに理解し合う、よりよい社会を築くことでした。
            </p>
            <p>
              古代オリンピックのエケケイリアには、争いのなかでも人々が安全に集い、競技を通して交流できる場を守ろうとする願いが込められています。そして現代のオリンピック教育は、他者への敬意、共感、公平性、協力といった価値を、私たちの日常生活につなげることを目指しています。
            </p>
            <p>相手の立場に立って考えることも、身近な人を尊重することも、すべて平和につながる学びです。</p>
            <p>違いを知り、相手を理解し、互いを尊重しながら行動する。</p>
            <p className="font-display text-base text-white sm:text-lg">
              その一歩を、私たち一人ひとりから始めていきましょう。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
