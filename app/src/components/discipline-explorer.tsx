"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { LOGO_WEDGES } from "@/lib/constants/logo-geometry";
import { DISCIPLINES, SITE } from "@/lib/constants/site";
import type { DisciplineId } from "@/types";

/*
 * ロゴの五角形そのものを使った競技紹介。
 *
 * 面ごとにカードを並べる案は、ロゴの配置を再現しようとすると
 * どうしても不格好になったため取りやめた。代わりにロゴを大きく見せ、
 * 各面にホバー（スマホはタップ）すると他の面が白く沈んで
 * その競技だけが浮かび上がるようにしている。
 *
 * ホバー領域の座標は scripts/prepare-logo.mjs が logo-geometry.ts に
 * 書き出すので、ロゴを差し替えても手で直す必要はない。
 *
 * SVG はマウス操作の補助なので aria-hidden にし、
 * キーボードとスクリーンリーダー向けには下のボタン列で同じ操作を提供する。
 */
export function DisciplineExplorer() {
  const router = useRouter();
  const [active, setActive] = useState<DisciplineId | null>(null);

  const current = DISCIPLINES.find((d) => d.id === active) ?? null;
  const currentIndex = DISCIPLINES.findIndex((d) => d.id === active);
  const activeWedge = LOGO_WEDGES.find((w) => w.id === active) ?? null;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-md">
        <Image
          src="/logo-mark.png"
          alt={SITE.nameEn}
          width={512}
          height={512}
          className="w-full"
        />

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
              <image
                href={`/icons/overlay-${activeWedge.id}.png`}
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
          className="absolute inset-0 h-full w-full"
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
                {String(currentIndex + 1).padStart(2, "0")} / {current.nameEn}
              </p>
              <h3 className={`mt-3 text-2xl sm:text-3xl ${current.text}`}>{current.name}</h3>
              <p className="mt-4 text-sm leading-relaxed text-navy-700 sm:text-base">
                {current.summary}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{current.detail}</p>
            </>
          ) : (
            <>
              {/* 既定表示ではラベルを出さない。セクション見出しの
                  「DISCIPLINES」と重なって同じ語が2回並んでしまうため。 */}
              <h3 className="text-2xl text-navy-800 sm:text-3xl">ひとりで、5つすべてを。</h3>
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
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${d.chip}`} />
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
  );
}
