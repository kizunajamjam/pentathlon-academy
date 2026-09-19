"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { LOGO_WEDGES } from "@/lib/constants/logo-geometry";
import { DISCIPLINES, SITE } from "@/lib/constants/site";
import {
  ASSEMBLED,
  ASSEMBLY_TOTAL,
  LOGO_STAR,
  assemblyFrame,
  type AssemblyFrame,
} from "@/lib/logo-assembly";
import { assetPath } from "@/lib/utils/asset";
import type { DisciplineId } from "@/types";

/*
 * ロゴの五角形そのものを使った競技紹介。
 *
 * 面ごとにカードを並べる案は、ロゴの配置を再現しようとすると
 * どうしても不格好になったため取りやめた。代わりにロゴを大きく見せ、
 * 各面にホバー（スマホはタップ）すると他の面が白く沈んで
 * その競技だけが浮かび上がるようにしている。
 *
 * ロゴは1枚絵ではなく、面5枚＋星＋P の7枚を重ねて組み立てている。
 * スクロールしてこのセクションに入ってくるあいだに、その7枚が順に
 * 寄ってきて組み上がる（動きの計算は lib/logo-assembly.ts）。
 * 素材の切り出しとホバー領域の座標は scripts/prepare-logo.mjs が
 * 書き出すので、ロゴを差し替えても手で直す必要はない。
 *
 * SVG はマウス操作の補助なので aria-hidden にし、
 * キーボードとスクリーンリーダー向けには下のボタン列で同じ操作を提供する。
 */

// きらめきの放射線。長い線と短い線を交互に12本。
const RAYS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * Math.PI) / 6;
  const long = i % 3 === 0;
  return {
    x1: LOGO_STAR.x + Math.cos(angle) * 1.2,
    y1: LOGO_STAR.y + Math.sin(angle) * 1.2,
    x2: LOGO_STAR.x + Math.cos(angle) * (long ? 17 : 7.5),
    y2: LOGO_STAR.y + Math.sin(angle) * (long ? 17 : 7.5),
    width: long ? 0.75 : 0.35,
  };
});

/*
 * ロゴが組み上がるまでの区間の長さ（画面の高さに対する割合）。
 *
 * この区間のあいだロゴは画面に留まり、スクロールした分だけ組み上がる。
 * 時間で動かしていたときは、組み上がりきる前にスクロールでロゴが画面から
 * 出てしまい、最後まで見られなかった。留めてしまえば通り過ぎようがない。
 * 大きくするほど、組み上がるまでに多くスクロールが要る＝ゆっくりになる。
 */
const SCROLL_SPAN_VH = 120;

/*
 * 留まりはじめる前から動き出す量（画面の高さに対する割合）。
 * 0 にすると、ロゴが空っぽのまま画面に入ってきて留まってから動き出す。
 * 少し先行させると、上がってくる途中から面が寄りはじめる。
 */
const LEAD_IN = 0.35;

export function DisciplineExplorer() {
  const router = useRouter();
  const [active, setActive] = useState<DisciplineId | null>(null);
  // 組み上がる前はホバーを受けない。飛んでいる最中の面を掴めても意味がないため。
  const [assembled, setAssembled] = useState(true);

  const current = DISCIPLINES.find((d) => d.id === active) ?? null;
  const currentIndex = DISCIPLINES.findIndex((d) => d.id === active);
  const activeWedge = LOGO_WEDGES.find((w) => w.id === active) ?? null;

  const trackRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<
    Partial<Record<DisciplineId, HTMLImageElement | null>>
  >({});
  const starRef = useRef<HTMLImageElement>(null);
  const markRef = useRef<HTMLImageElement>(null);
  const haloRef = useRef<SVGCircleElement>(null);
  const raysRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const apply = (f: AssemblyFrame) => {
      for (const wedge of LOGO_WEDGES) {
        const el = pieceRefs.current[wedge.id];
        if (!el) continue;
        const s = f.pieces[wedge.id];
        el.style.opacity = String(s.opacity);
        el.style.transform = `translate(${s.dx}%, ${s.dy}%) scale(${s.scale})`;
      }
      if (starRef.current) {
        starRef.current.style.opacity = String(f.star.opacity);
        starRef.current.style.transformOrigin = `${LOGO_STAR.x}% ${LOGO_STAR.y}%`;
        starRef.current.style.transform = `scale(${f.star.scale}) rotate(${f.star.rotate}deg)`;
        starRef.current.style.filter = `brightness(${f.star.brightness})`;
      }
      if (markRef.current) {
        markRef.current.style.opacity = String(f.p.opacity);
        markRef.current.style.transformOrigin = "50% 55%";
        markRef.current.style.transform = `translateY(${f.p.translateY}%) scale(${f.p.scale})`;
      }
      if (haloRef.current) {
        haloRef.current.setAttribute(
          "opacity",
          Math.min(1, f.sparkle.strength * 0.7).toFixed(3),
        );
        haloRef.current.setAttribute("r", f.sparkle.haloRadius.toFixed(2));
      }
      if (raysRef.current) {
        raysRef.current.setAttribute(
          "opacity",
          Math.min(1, f.sparkle.strength * 0.95).toFixed(3),
        );
        raysRef.current.setAttribute(
          "transform",
          `translate(${LOGO_STAR.x} ${LOGO_STAR.y}) rotate(${f.sparkle.raysRotate}) ` +
            `scale(${f.sparkle.raysScale}) translate(${-LOGO_STAR.x} ${-LOGO_STAR.y})`,
        );
      }
    };

    /*
     * 区間のどこまで進んだか（0〜1）。
     *
     * 区間の上端が画面の上端に届くとロゴは留まりはじめ、そこから
     * 区間を抜けるまでのスクロール量が、そのまま組み上がり具合になる。
     * 留まっているあいだは画面から出ていかないので、通り過ぎようがない。
     */
    const progressNow = () => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const lead = vh * LEAD_IN;
      const span = track.offsetHeight - vh + lead;
      return span > 0 ? Math.max(0, Math.min(1, (lead - rect.top) / span)) : 1;
    };

    // 動きを減らす設定の人には、完成した姿のまま出す。
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // 読み込んだ時点で既に区間へ入っているなら、組み上げ直さない。
    // 完成形からいきなり途中へ飛ぶと、ちらついて見えるため。
    if (progressNow() > 0.02) return;

    setAssembled(false);
    apply(assemblyFrame(0));

    let queued = false;
    let wasAssembled = false;

    const update = () => {
      queued = false;
      const progress = progressNow();
      apply(assemblyFrame(progress * ASSEMBLY_TOTAL));
      // 組み上がってはじめて、面にふれられるようにする
      const done = progress >= 1;
      if (done !== wasAssembled) {
        wasAssembled = done;
        setAssembled(done);
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    /*
      組み上がるまでロゴを画面に留めるための区間。
      区間の上端が画面の上端に届くと中身が貼りつき、区間を抜けるまで
      そこに留まる。そのあいだのスクロールが組み上がり具合になるので、
      途中で画面から出ていくことがない。

      ロゴの幅は画面が低いときだけ縮める。iPhone SE のような 667px の
      画面では、20rem のままだとロゴと文章が1画面に収まらないため。
    */
    <div
      ref={trackRef}
      className="relative h-[calc(100svh+var(--logo-span))] motion-reduce:h-auto"
      style={{ "--logo-span": `${SCROLL_SPAN_VH}vh` } as CSSProperties}
    >
      {/*
        ヘッダーは画面の上に貼りついたままなので、その下に留める。
        top-0 にすると、画面の低い端末でロゴの上部がヘッダーに隠れる。
      */}
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center motion-reduce:static motion-reduce:h-auto lg:top-20 lg:h-[calc(100svh-5rem)]">
        <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto aspect-square w-full max-w-[min(20rem,36svh)] sm:max-w-sm lg:max-w-md">
            {/*
          ロゴ本体。7枚を重ねて1枚のロゴになる。
          style に初期値を置いているのは、JavaScript が動く前や
          動きを減らす設定のときに、完成した姿で出したいため。
        */}
            {LOGO_WEDGES.map((wedge) => (
              <Image
                key={wedge.id}
                ref={(el) => {
                  pieceRefs.current[wedge.id] = el;
                }}
                src={assetPath(`/icons/overlay-${wedge.id}.png`)}
                alt=""
                width={512}
                height={512}
                priority
                className="absolute inset-0 h-full w-full"
                style={{ opacity: ASSEMBLED.pieces[wedge.id].opacity }}
              />
            ))}
            <Image
              ref={starRef}
              src={assetPath("/icons/center-star.png")}
              alt=""
              width={512}
              height={512}
              className="absolute inset-0 h-full w-full"
              style={{ opacity: ASSEMBLED.star.opacity }}
            />
            <Image
              ref={markRef}
              src={assetPath("/icons/center-p.png")}
              alt={SITE.nameEn}
              width={512}
              height={512}
              className="absolute inset-0 h-full w-full"
              style={{ opacity: ASSEMBLED.p.opacity }}
            />

            {/* 星のきらめき。組み上がったあとは透明のまま残る。 */}
            <svg
              viewBox="0 0 100 100"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="logo-halo">
                  <stop offset="0%" stopColor="#fff7e0" stopOpacity="1" />
                  <stop offset="45%" stopColor="#f0d89a" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#e8c97a" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle
                ref={haloRef}
                cx={LOGO_STAR.x}
                cy={LOGO_STAR.y}
                r={3}
                fill="url(#logo-halo)"
                opacity={0}
              />
              <g
                ref={raysRef}
                stroke="#fdf3d4"
                strokeLinecap="round"
                opacity={0}
              >
                {RAYS.map((ray, i) => (
                  <line
                    key={i}
                    x1={ray.x1}
                    y1={ray.y1}
                    x2={ray.x2}
                    y2={ray.y2}
                    strokeWidth={ray.width}
                  />
                ))}
              </g>
            </svg>

            {/*
          ホバーした面だけをその場で少し大きく見せる。

          ロゴ全体（等倍）の上に、その面の「塗られている部分だけ」を切り出した
          画像を重ねて拡大している。素の三角形で切ると面のあいだの白い隙間や
          中央の「P」まで一緒に拡大されてしまうため、
          overlay-*.png は scripts/prepare-logo.mjs 側で
          隙間と中心を除いた形に作ってある。

          拡大の基点はその塗り領域の重心なので、外へせり出さずその場で膨らむ。
        */}
            <svg
              viewBox="0 0 100 100"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              {activeWedge && (
                <g
                  style={{
                    transformBox: "view-box",
                    transformOrigin: `${activeWedge.centroid.x}px ${activeWedge.centroid.y}px`,
                    transform: "scale(1.08)",
                    transition: "transform 250ms ease-out",
                  }}
                >
                  {/* SVG の href には basePath が自動で付かないので自分で補う */}
                  <image
                    href={assetPath(`/icons/overlay-${activeWedge.id}.png`)}
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                  />
                </g>
              )}
            </svg>

            {/* 当たり判定。上の層はクリックを透過させ、ここだけで受ける。 */}
            <svg
              viewBox="0 0 100 100"
              className={`absolute inset-0 h-full w-full ${assembled ? "" : "pointer-events-none"}`}
              aria-hidden="true"
              onMouseLeave={() => setActive(null)}
            >
              {LOGO_WEDGES.map((w) => (
                <polygon
                  key={w.id}
                  points={w.points}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActive(w.id)}
                  onClick={() => router.push(`/disciplines#${w.id}`)}
                />
              ))}
            </svg>
          </div>

          <div>
            {/*
          高さの確保はホバーで表示が入れ替わる lg 以上だけ。
          スマホではボタンが詳細ページへの遷移になり入れ替わりが起きないので、
          固定するとそのぶん空白が空いてしまう。
        */}
            <div className="lg:min-h-[15rem]">
              {current ? (
                <>
                  <p className="eyebrow text-xs text-gold-600">
                    {String(currentIndex + 1).padStart(2, "0")} /{" "}
                    {current.nameEn}
                  </p>
                  <h3 className={`mt-3 text-2xl sm:text-3xl ${current.text}`}>
                    {current.name}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-navy-700 sm:text-base">
                    {current.summary}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {current.detail}
                  </p>
                </>
              ) : (
                <>
                  {/* 既定表示ではラベルを出さない。セクション見出しの
                  「DISCIPLINES」と重なって同じ語が2回並んでしまうため。 */}
                  <h3 className="text-2xl text-navy-800 sm:text-3xl">
                    ひとりで、5つすべてを。
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                    近代五種は、性質のまったく違う5つの競技を1人の選手がすべて行い、
                    総合力で順位を決める競技です。ロゴの5つの面が、その5種目にあたります。
                  </p>
                  <p className="mt-4 hidden text-xs text-navy-400 lg:block">
                    ロゴの各面にカーソルを合わせると、競技の説明が表示されます。
                  </p>
                </>
              )}
            </div>

            <ul className="mt-8 flex flex-wrap gap-2.5">
              {DISCIPLINES.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/disciplines#${d.id}`}
                    onMouseEnter={() => setActive(d.id)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(d.id)}
                    onBlur={() => setActive(null)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                      active === d.id
                        ? "border-navy-800 bg-navy-800 text-white"
                        : "border-border text-navy-700 hover:border-navy-300"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${d.chip}`}
                    />
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href="/disciplines"
                className="inline-flex items-center gap-2 text-sm font-bold text-navy-800 transition-colors hover:text-gold-600"
              >
                5種目とトレーニング内容を詳しく見る
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
