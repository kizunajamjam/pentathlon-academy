/*
 * 黒背景・発光版のロゴ（public/logo.png）から、サイトで使う画像を切り出す。
 *
 *   public/logo-mark.png               五角形マークのみ（正方形・ヘッダー用）
 *   public/icons/overlay-{競技}.png    各面をマークと同じ座標に置いたもの（トップの組み上がり用）
 *   public/icons/center-p.png          中央の「P」
 *   public/icons/center-star.png       中央の星
 *   src/app/icon.png / apple-icon.png  ファビコン
 *   public/og.png                      OGP用 1200x630
 *   src/lib/constants/logo-geometry.ts 各面の輪郭と重心、星の位置
 *
 * 実行: node scripts/prepare-logo-glow.mjs
 *
 * ── 旧ロゴ用の prepare-logo.mjs との違い ─────────────────────────────
 * 旧ロゴは白地で、面と面のあいだが白い隙間で切れていたため、画像から面を
 * 自動で見つけられた。新ロゴは黒地で、面のあいだを発光する金の線がつないで
 * いるので、その方法では面が1つにつながってしまう。
 *
 * 新ロゴは旧ロゴと同じ構図（五角形の配置・面の分け方）なので、旧ロゴで求めた
 * 面の輪郭（BASE_WEDGES）を、五角形の外接矩形どうしが重なるように写して使う。
 * 面の画像は輪郭を少し太らせて切り、境目の金の線も含める。黒い余白が
 * 少し入るが、トップのロゴ欄は背景を同じ黒にしているので見えない。
 *
 * 中央の「P」と星は黒地の上にあるので、明るさをそのまま不透明度にして
 * 抜き出す（黒＝透明）。黒の上に重ねると元の画像と同じ見た目に戻る。
 */
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const SRC = "public/logo.png";

/*
 * 旧ロゴ（白地版）で求めた各面の輪郭。旧 logo-mark.png 上の座標（0〜100）。
 * 旧ロゴでは、マークの正方形の左端・幅が五角形の外接矩形の左端・幅と一致し、
 * 上下は外接矩形（高さ900px）を幅945pxの正方形の中央に置いていた。
 */
const BASE = { side: 945, top: 1, bboxTop: 23, bboxH: 900 };
const BASE_WEDGES = {
  fencing: "50.90,2.33 51.01,2.33 51.64,2.65 52.70,3.28 54.81,4.66 57.57,6.46 68.99,14.07 78.10,20.21 83.07,23.60 85.08,24.97 88.57,27.41 91.11,29.21 91.85,29.74 94.18,31.43 96.93,33.44 98.73,34.81 99.68,35.56 99.79,35.66 99.79,35.77 73.97,45.08 73.65,45.19 73.54,45.19 71.64,43.81 52.80,30.05 51.22,28.89 50.90,28.57",
  obstacle: "20.85,97.35 21.16,96.83 35.34,73.76 35.56,73.44 35.77,73.23 61.27,63.60 61.59,63.60 62.01,64.13 62.12,64.34 77.67,97.35 77.67,97.46 20.85,97.46",
  swimming: "0.00,37.88 0.11,37.78 1.69,38.31 5.93,39.89 25.08,47.09 25.61,47.30 25.71,47.51 33.86,71.53 33.97,71.96 33.97,72.17 33.54,72.91 25.50,86.03 22.12,91.53 20.53,94.07 19.26,96.08 19.05,96.40 18.84,96.61 18.73,96.61 18.20,95.03 0.42,39.47 0.00,38.10",
  shooting: "64.66,71.32 65.93,67.94 67.51,63.81 69.31,59.15 70.58,55.87 73.54,48.36 73.97,47.30 74.39,47.09 78.31,45.61 87.83,42.01 91.22,40.74 94.92,39.37 98.10,38.31 99.58,37.88 99.89,37.88 95.66,50.79 86.35,78.73 81.06,94.29 80.11,97.04 80.00,97.14 79.89,97.04 64.76,71.64 64.66,71.43",
  running: "0.11,35.66 0.32,35.45 3.92,32.91 4.97,32.17 7.72,30.26 9.42,29.10 16.83,24.02 22.86,19.89 25.50,18.10 38.94,8.99 42.86,6.35 47.41,3.28 48.68,2.43 48.99,2.43 48.99,28.47 48.68,28.78 48.25,29.10 26.24,45.19 26.03,45.19 0.11,35.77",
};
const ORDER = ["fencing", "obstacle", "swimming", "shooting", "running"];

const OUT = 512;
/** 面を切るときに輪郭を太らせる量（マーク幅に対する%）。境目の金の線を含めるため。 */
const GROW = 1.2;

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const px = (x, y) => {
  const i = (y * W + x) * 3;
  return [data[i], data[i + 1], data[i + 2]];
};
const lit = (x, y) => Math.max(...px(x, y)) > 90;

// ── 五角形の外接矩形（ワードマークとの間の空行で下端が決まる） ──
let top = -1;
let bottom = -1;
for (let y = 0; y < H; y++) {
  let n = 0;
  for (let x = 0; x < W; x++) if (lit(x, y)) n++;
  const has = n > 3;
  if (has && top < 0) top = y;
  if (has) bottom = y;
  if (top >= 0 && !has && y - bottom > 15) break;
}
let left = W;
let right = 0;
for (let y = top; y <= bottom; y++)
  for (let x = 0; x < W; x++)
    if (lit(x, y)) {
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
const bw = right - left + 1;
const bh = bottom - top + 1;
const side = Math.max(bw, bh);
const sqLeft = left - (side - bw) / 2;
const sqTop = top - (side - bh) / 2;
console.log("pentagon bbox:", { left, right, top, bottom, side });

// 旧マーク座標(0〜100) → 新マーク座標(0〜100)
function mapPoint(x, y) {
  const u = x / 100; // 旧マークは左端・幅が外接矩形と一致
  const v = (BASE.top + (y / 100) * BASE.side - BASE.bboxTop) / BASE.bboxH;
  const nx = left + u * bw;
  const ny = top + v * bh;
  return [((nx - sqLeft) / side) * 100, ((ny - sqTop) / side) * 100];
}
const wedges = Object.fromEntries(
  ORDER.map((id) => [
    id,
    BASE_WEDGES[id].split(" ").map((p) => mapPoint(...p.split(",").map(Number))),
  ]),
);

// ── マークを正方形で切り出す（はみ出す分は黒で埋める） ──
const pad = Math.ceil(Math.max(0, -sqTop, -sqLeft)) + 2;
const padded = await sharp(SRC)
  .removeAlpha()
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#000000" })
  .toBuffer();
const markRaw = await sharp(padded)
  .extract({
    left: Math.round(sqLeft + pad),
    top: Math.round(sqTop + pad),
    width: Math.round(side),
    height: Math.round(side),
  })
  .resize(OUT, OUT)
  .raw()
  .toBuffer();
await sharp(markRaw, { raw: { width: OUT, height: OUT, channels: 3 } })
  .png()
  .toFile("public/logo-mark.png");

const mp = (x, y) => {
  const i = (y * OUT + x) * 3;
  return [markRaw[i], markRaw[i + 1], markRaw[i + 2]];
};

// ── 点が多角形の内側か（太らせ量つき） ──
function inside(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function distToPoly(poly, x, y) {
  let d = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [x1, y1] = poly[j];
    const [x2, y2] = poly[i];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy || 1)));
    d = Math.min(d, Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)));
  }
  return d;
}
const inGrown = (poly, x, y) => inside(poly, x, y) || distToPoly(poly, x, y) <= GROW;

// ── 各面の画像 ──
for (const id of ORDER) {
  const out = Buffer.alloc(OUT * OUT * 4);
  for (let y = 0; y < OUT; y++)
    for (let x = 0; x < OUT; x++) {
      const X = ((x + 0.5) / OUT) * 100;
      const Y = ((y + 0.5) / OUT) * 100;
      if (!inGrown(wedges[id], X, Y)) continue;
      const [r, g, b] = mp(x, y);
      const o = (y * OUT + x) * 4;
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = 255;
    }
  await sharp(out, { raw: { width: OUT, height: OUT, channels: 4 } })
    .png()
    .toFile(`public/icons/overlay-${id}.png`);
}

// ── 中央の P と星（明るさ＝不透明度で抜く） ──
// 五角形の外（外側の発光）と、面の内側のフチの金の線は含めない
const outline = convexHull(ORDER.flatMap((id) => wedges[id]));
const CENTER_GAP = 2.4;
const isCenter = (X, Y) =>
  inside(outline, X, Y) && !ORDER.some((id) => inside(wedges[id], X, Y) || distToPoly(wedges[id], X, Y) <= CENTER_GAP);
// 星は旧ロゴでの位置の近く（半径 STAR_R）にある金色だけ。それ以外の金（P のフチの光など）は P に含める
const [starX0, starY0] = mapPoint(52.13, 60.79);
const STAR_R = 7;
const STAR_CORE = 5;
// 金色（星）か。P は銀色で彩度が低い。
const isGold = (r, g, b) => r > 60 && r - b > 45 && g - b > 20;

let sx = 0;
let sy = 0;
let sn = 0;
const pBuf = Buffer.alloc(OUT * OUT * 4);
const sBuf = Buffer.alloc(OUT * OUT * 4);
for (let y = 0; y < OUT; y++)
  for (let x = 0; x < OUT; x++) {
    const X = ((x + 0.5) / OUT) * 100;
    const Y = ((y + 0.5) / OUT) * 100;
    if (!isCenter(X, Y)) continue;
    const [r, g, b] = mp(x, y);
    const a = Math.max(r, g, b);
    if (a < 8) continue;
    const dStar = Math.hypot(X - starX0, Y - starY0);
    // 星の芯（白い光の部分も含む）は色に関係なく星へ。周りの光は金色のものだけ星へ
    const gold = dStar <= STAR_CORE || (isGold(r, g, b) && dStar <= STAR_R);
    const buf = gold ? sBuf : pBuf;
    const o = (y * OUT + x) * 4;
    // 黒の上に重ねたとき元の色に戻るよう、色を不透明度で割り戻す
    buf[o] = Math.min(255, Math.round((r * 255) / a));
    buf[o + 1] = Math.min(255, Math.round((g * 255) / a));
    buf[o + 2] = Math.min(255, Math.round((b * 255) / a));
    buf[o + 3] = a;
    if (gold && a > 120) {
      sx += X;
      sy += Y;
      sn++;
    }
  }
await sharp(pBuf, { raw: { width: OUT, height: OUT, channels: 4 } }).png().toFile("public/icons/center-p.png");
await sharp(sBuf, { raw: { width: OUT, height: OUT, channels: 4 } }).png().toFile("public/icons/center-star.png");
const star = { x: sx / sn, y: sy / sn };

function convexHull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => {
    const h = [];
    for (const p of list) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      h.push(p);
    }
    h.pop();
    return h;
  };
  return half(pts).concat(half(pts.slice().reverse()));
}

// ── 輪郭と重心を書き出す ──
const centroid = (poly) => {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const f = poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
    a += f;
    cx += (poly[j][0] + poly[i][0]) * f;
    cy += (poly[j][1] + poly[i][1]) * f;
  }
  return { x: cx / (3 * a), y: cy / (3 * a) };
};
const f2 = (v) => v.toFixed(2);
const lines = ORDER.map((id) => {
  const pts = wedges[id].map(([x, y]) => `${f2(x)},${f2(y)}`).join(" ");
  const c = centroid(wedges[id]);
  return `  { id: "${id}", points: "${pts}", centroid: { x: ${f2(c.x)}, y: ${f2(c.y)} } },`;
});
await writeFile(
  "src/lib/constants/logo-geometry.ts",
  `// scripts/prepare-logo-glow.mjs が生成。直接編集しないこと。
// logo-mark.png 上での各面の情報（viewBox="0 0 100 100" 基準）。
//   points   … 面の輪郭。ホバーの当たり判定に使う
//   centroid … 面の重心。拡大の基点に使う
import type { DisciplineId } from "@/types";

export const LOGO_WEDGES: {
  id: DisciplineId;
  points: string;
  centroid: { x: number; y: number };
}[] = [
${lines.join("\n")}
];

// 中央の星の重心。組み上がる演出で、きらめきの光をここから出す。
export const LOGO_STAR = { x: ${f2(star.x)}, y: ${f2(star.y)} };
`,
);

// ── ファビコン・OGP ──
await sharp("public/logo-mark.png").resize(96, 96).png().toFile("src/app/icon.png");
await sharp("public/logo-mark.png").resize(180, 180).png().toFile("src/app/apple-icon.png");
const ogLogo = await sharp(SRC).resize(600, 600, { fit: "contain", background: "#000000" }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#000000" } })
  .composite([{ input: ogLogo, left: 300, top: 15 }])
  .png()
  .toFile("public/og.png");

console.log("star:", star);
console.log("done");
