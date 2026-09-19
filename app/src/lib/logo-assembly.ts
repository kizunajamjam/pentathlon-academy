import { LOGO_STAR, LOGO_WEDGES } from "@/lib/constants/logo-geometry";
import type { DisciplineId } from "@/types";

/*
 * ロゴが1枚ずつ寄ってきて組み上がる動き。
 *
 * 時刻 t（秒）を渡すと、その瞬間の各素材の位置・不透明度・拡大率が返る。
 * ここには DOM が出てこないので、スクロール連動でも自動再生でも同じ計算を使える。
 *
 * 5つの面 → 星が出て煌めく → 中央の P、の順。オーナーの指示による。
 * 面の出る順は左上→右上→左→下→右で、画面のうえで左右に振りながら最後に
 * 真ん中下が入る。競技の並び順（フェンシング→オブスタクル→…）にすると
 * 画面上を飛び回る動きになるため、ここでは見た目の流れを優先している。
 */

/** 最初の面が動き出してから P が出そろうまで（秒）。 */
export const ASSEMBLY_TOTAL = 5.6;

/** 各面が入りはじめる時刻（秒）。 */
const ENTER: Record<DisciplineId, number> = {
  running: 0,
  fencing: 0.55,
  swimming: 1.1,
  obstacle: 1.6,
  shooting: 2.1,
};
/** 1枚が入りきるまでの時間（秒）。 */
const ENTER_DURATION = 0.95;

const STAR_AT = 2.95;
const STAR_DURATION = 0.75;
/** きらめきが続く時間。この幅のなかで強弱3回の山をつくる。 */
const TWINKLE_SPAN = 1.5;

const P_AT = 3.7;
const P_DURATION = 1;

/** 面が待機する位置。重心から外へどれだけ離すか（中心からの距離に対する割合）。 */
const OFFSET = 0.34;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);

/**
 * きらめきの強さ（0〜およそ1.8）。
 * 強い山のあとに弱い山を2回重ねて、ちかちかと瞬くように見せる。
 */
function twinkle(u: number): number {
  if (u <= 0 || u >= 1) return 0;
  return (
    Math.pow(Math.sin(Math.PI * Math.min(1, u / 0.42)), 1.6) +
    Math.pow(Math.sin(Math.PI * clamp01((u - 0.45) / 0.35)), 2) * 0.55 +
    Math.pow(Math.sin(Math.PI * clamp01((u - 0.78) / 0.22)), 2) * 0.25
  );
}

export type PieceState = { opacity: number; dx: number; dy: number; scale: number };

export type AssemblyFrame = {
  /** 5種目の面。dx/dy は自分の幅に対する割合（%）。 */
  pieces: Record<DisciplineId, PieceState>;
  star: { opacity: number; scale: number; rotate: number; brightness: number };
  /** 星から出る光。halo は円の半径、rays は放射線。 */
  sparkle: { strength: number; haloRadius: number; raysRotate: number; raysScale: number };
  p: { opacity: number; translateY: number; scale: number };
};

/** 時刻 t（秒）における全素材の状態。t は 0 未満や TOTAL 超過でも安全。 */
export function assemblyFrame(t: number): AssemblyFrame {
  const pieces = {} as Record<DisciplineId, PieceState>;
  for (const wedge of LOGO_WEDGES) {
    const k = easeOut(clamp01((t - ENTER[wedge.id]) / ENTER_DURATION));
    // 重心の向きへ逃がした位置から中心へ寄ってくる
    pieces[wedge.id] = {
      opacity: k,
      dx: (wedge.centroid.x - 50) * OFFSET * (1 - k),
      dy: (wedge.centroid.y - 50) * OFFSET * (1 - k),
      scale: 0.86 + 0.14 * k,
    };
  }

  const starIn = clamp01((t - STAR_AT) / STAR_DURATION);
  const strength = twinkle(clamp01((t - STAR_AT) / TWINKLE_SPAN));

  const pIn = easeOut(clamp01((t - P_AT) / P_DURATION));

  return {
    pieces,
    star: {
      opacity: easeOut(starIn),
      // 出るときに少しだけ行き過ぎてから収まる
      scale: 0.35 + 0.65 * easeOut(starIn) + 0.18 * Math.sin(Math.PI * starIn),
      rotate: (1 - easeOut(starIn)) * -35,
      brightness: 1 + strength * 0.95,
    },
    sparkle: {
      strength,
      haloRadius: 3 + strength * 13,
      raysRotate: strength * 26,
      raysScale: 0.45 + strength * 0.85,
    },
    p: { opacity: pIn, translateY: (1 - pIn) * 3, scale: 0.93 + 0.07 * pIn },
  };
}

/** 完成した姿（動きを減らす設定のときや、JavaScript が動く前に使う）。 */
export const ASSEMBLED = assemblyFrame(ASSEMBLY_TOTAL);

export { LOGO_STAR };
