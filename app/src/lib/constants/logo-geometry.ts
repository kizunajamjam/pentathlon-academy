// scripts/prepare-logo-pieces.mjs が生成。直接編集しないこと。
// public/icons/overlay-*.png 上での各面の情報（viewBox="0 0 100 100" 基準）。
//   points   … 面の輪郭（金の縁を含む四角形）。ホバーの当たり判定に使う
//   centroid … 面の重心。拡大の基点に使う
import type { DisciplineId } from "@/types";

export const LOGO_WEDGES: {
  id: DisciplineId;
  points: string;
  centroid: { x: number; y: number };
}[] = [
  { id: "fencing", points: "49.39,5.32 99.80,38.33 72.99,48.02 49.33,30.23", centroid: { x: 69.00, y: 29.74 } },
  { id: "obstacle", points: "35.95,71.76 60.37,66.93 79.70,94.31 19.68,94.31", centroid: { x: 50.00, y: 83.50 } },
  { id: "swimming", points: "0.79,37.57 27.89,47.05 37.00,72.24 20.92,94.52", centroid: { x: 20.28, y: 63.30 } },
  { id: "shooting", points: "72.23,47.35 99.31,37.58 78.45,94.96 62.85,71.23", centroid: { x: 79.61, y: 63.40 } },
  { id: "running", points: "-0.06,38.38 50.55,5.37 50.55,30.29 27.10,47.91", centroid: { x: 30.89, y: 29.75 } },
];

// 中央の星の重心。組み上がる演出で、きらめきの光をここから出す。
export const LOGO_STAR = { x: 51.79, y: 61.39 };
