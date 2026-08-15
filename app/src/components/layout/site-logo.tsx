import Image from "next/image";

import { SITE } from "@/lib/constants/site";
import { assetPath } from "@/lib/utils/asset";

/*
 * ロゴまわり。
 *
 * LogoMark    … 実物ロゴの五角形部分（public/logo-mark.png）
 * PentagonMotif … 五角形だけを再現したSVG。背景の透かし用。
 *
 * 実物ロゴは白背景なので、紺地のヘッダーでは白いバッジに載せている。
 * 背景を透過させるとロゴ中央の紺色の "P" が地色に溶けて消えるため、
 * ロゴ自体は加工せずそのまま使う方針。
 */

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src={assetPath("/logo-mark.png")}
      alt={SITE.nameEn}
      width={size}
      height={size}
      priority
      className={className}
    />
  );
}

// 中心(50,50)・半径48の正五角形の頂点（真上から時計回り）
const P = [
  [50, 2],
  [95.65, 35.17],
  [78.21, 88.83],
  [21.79, 88.83],
  [4.35, 35.17],
];

const WEDGES = [
  { from: 0, to: 1, fill: "var(--color-gold-500)" }, // フェンシング
  { from: 1, to: 2, fill: "var(--color-shoot-500)" }, // 射撃
  { from: 2, to: 3, fill: "var(--color-obstacle-500)" }, // 障害物レース
  { from: 3, to: 4, fill: "var(--color-swim-500)" }, // 水泳
  { from: 4, to: 0, fill: "var(--color-navy-800)" }, // ランニング
];

// 背景に薄く敷く装飾用。写真のように白背景を持たないので低不透明度でも成立する。
export function PentagonMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {WEDGES.map((w) => (
        <path
          key={w.from}
          d={`M50 50 L${P[w.from][0]} ${P[w.from][1]} L${P[w.to][0]} ${P[w.to][1]} Z`}
          fill={w.fill}
          stroke="white"
          strokeWidth={3}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

// マーク + 文字組み。ヘッダー / フッターで共用する。
export function SiteLogo({ tone = "light" }: { tone?: "light" | "dark" }) {
  const main = tone === "light" ? "text-white" : "text-navy-800";
  const sub = tone === "light" ? "text-gold-300" : "text-gold-600";

  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white p-1">
        <LogoMark size={40} className="h-full w-full object-contain" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display text-base font-black tracking-[0.06em] ${main}`}>
          {SITE.nameEn}
        </span>
        <span className={`mt-1 font-display text-[10px] font-medium tracking-[0.22em] ${sub}`}>
          ペンタスロンアカデミー
        </span>
      </span>
    </span>
  );
}
