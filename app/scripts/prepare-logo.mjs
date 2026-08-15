/*
 * public/logo.png から、サイトで使う画像を切り出す。
 *
 *   public/icons/{競技}.png          各面（競技アイコン・余白を詰めたもの）
 *   public/icons/overlay-{競技}.png  同じ面をロゴ全体と同じ座標に置いたもの
 *                                    （トップページでロゴに重ねて拡大する用）
 *   public/logo-mark.png             五角形マークのみ（正方形・ヘッダー用）
 *   src/app/icon.png                 ファビコン
 *   public/og.png                    OGP用 1200x630
 *   src/lib/constants/logo-geometry.ts  各面の輪郭と重心
 *
 * 実行: node scripts/prepare-logo.mjs
 * ロゴを差し替えたときだけ再実行する（生成物はコミットする）。
 * 差し替え後は node scripts/check-wedges.mjs で目視確認すること。
 *
 * ── 面の範囲の求め方 ────────────────────────────────────────────────
 * 手で調整した定数は使わず、画像から実際の塗り範囲を求める。
 *
 *   1. 背景でない画素の連結領域を洗い出し、大きい順に5つを面とする
 *      （面のあいだは白い隙間で切れているので必ず分かれる）
 *   2. 選手のシルエットに分断された破片を、色と方向で照合して元の面に戻す
 *      （フェンシングは選手で面が2つに割れる。中央の「P」は同じ紺なので
 *        色だけでは区別できず、方向と中央領域の判定で弾く）
 *   3. 各面の凸包を取る。面は凸な四角形なので、これで外側の3辺が決まり、
 *      内側の白い選手シルエットも取り込まれる
 *   4. 中央の白い領域（「P」と星のある部分）を引く。各面の内側のフチは
 *      ここに削られて凹んでおり、凸包のままだと白い帯が入るため
 *
 * 4 の中央領域は、白を収縮させて面のあいだの細い隙間を切り、中心から
 * 塗りつぶして求める。収縮量は、領域が隙間を通って選手のシルエットまで
 * 触手状に伸びなくなるところまで自動で増やす。
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const SRC = "public/logo.png";
const OUT_ICONS = "public/icons";

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

/*
 * 背景（＝面の外）とみなす明るさの下限。
 *
 * ロゴの各面には薄い影がついている。閾値が高すぎる（＝背景と認めにくい）と
 * 影の画素まで「面の一部」として連結領域に入り、凸包が白いフチをまたいで
 * 内側に白い帯を作ってしまう。
 *
 * 面の色はどれも十分に濃く、最も明るいゴールド #c79a3e でも
 * 最小チャンネルは 62 しかないため、205 で切っても面自体は削れない。
 */
const BG_MIN = 205;

const idx = (x, y) => (y * W + x) * 4;
const isBg = (x, y) => {
  const i = idx(x, y);
  return data[i] > BG_MIN && data[i + 1] > BG_MIN && data[i + 2] > BG_MIN;
};

// ── 五角形マークの範囲を検出する ─────────────────────────────────────
// ワードマークとの間に空行があるので、そこでマークの下端が決まる。
let markTop = -1;
let markBottom = -1;
for (let y = 0; y < H; y++) {
  let has = false;
  for (let x = 0; x < W && !has; x++) if (!isBg(x, y)) has = true;

  if (has && markTop < 0) markTop = y;
  if (has) markBottom = y;
  if (markTop >= 0 && !has && y - markBottom > 20) break;
}

let leftX = W;
let rightX = 0;
for (let y = markTop; y <= markBottom; y++) {
  for (let x = 0; x < W; x++) {
    if (!isBg(x, y)) {
      if (x < leftX) leftX = x;
      if (x > rightX) rightX = x;
    }
  }
}

// マークを正方形で切り出す範囲。重ねる画像はすべてこの座標系に揃える。
const mw = rightX - leftX + 1;
const mh = markBottom - markTop + 1;
const side = Math.max(mw, mh);
const sqLeft = Math.max(0, Math.round(leftX - (side - mw) / 2));
const sqTop = Math.max(0, Math.round(markTop - (side - mh) / 2));

console.log("mark:", { markTop, markBottom, leftX, rightX });

// ── 背景でない画素の連結領域を求める ─────────────────────────────────
const regionW = rightX - leftX + 1;
const regionH = markBottom - markTop + 1;
const label = new Int32Array(regionW * regionH).fill(-1);
const components = [];

for (let y0 = 0; y0 < regionH; y0++) {
  for (let x0 = 0; x0 < regionW; x0++) {
    const start = y0 * regionW + x0;
    if (label[start] !== -1) continue;
    if (isBg(leftX + x0, markTop + y0)) continue;

    const id = components.length;
    const pixels = [];
    const stack = [start];
    label[start] = id;

    while (stack.length) {
      const p = stack.pop();
      const px = p % regionW;
      const py = (p / regionW) | 0;
      pixels.push([px, py]);

      const push = (nx, ny) => {
        if (nx < 0 || ny < 0 || nx >= regionW || ny >= regionH) return;
        const np = ny * regionW + nx;
        if (label[np] !== -1) return;
        if (isBg(leftX + nx, markTop + ny)) return;
        label[np] = id;
        stack.push(np);
      };
      push(px + 1, py);
      push(px - 1, py);
      push(px, py + 1);
      push(px, py - 1);
    }

    components.push({ id, pixels });
  }
}

components.sort((a, b) => b.pixels.length - a.pixels.length);

// 領域の代表色（最頻色）と重心。どの領域が何なのかを見分けるのに使う。
function describe(comp) {
  const counts = new Map();
  let sx = 0;
  let sy = 0;
  for (const [x, y] of comp.pixels) {
    sx += x;
    sy += y;
    const i = idx(leftX + x, markTop + y);
    const key = `${data[i] >> 5},${data[i + 1] >> 5},${data[i + 2] >> 5}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const [dom] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const rgb = dom.split(",").map((v) => Number(v) * 32 + 16);
  return { rgb, cx: sx / comp.pixels.length, cy: sy / comp.pixels.length };
}

console.log("連結領域(上位8):");
for (const c of components.slice(0, 8)) {
  const d = describe(c);
  console.log(
    `  ${String(c.pixels.length).padStart(6)}px  色=${d.rgb.join(",").padEnd(12)} 重心=${d.cx.toFixed(0)},${d.cy.toFixed(0)}`,
  );
}

const wedgeComponents = components.slice(0, 5);
if (wedgeComponents.length < 5 || wedgeComponents[4].pixels.length < 1000) {
  throw new Error("面を5つ検出できなかった。ロゴの構造が想定と違う可能性がある。");
}

// ── 各領域の凸包 ─────────────────────────────────────────────────────
function convexHull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function spansOfHull(hull, height) {
  const spans = new Array(height).fill(null);
  for (let i = 0; i < hull.length; i++) {
    const [x1, y1] = hull[i];
    const [x2, y2] = hull[(i + 1) % hull.length];
    if (y1 === y2) {
      const y = y1;
      if (y >= 0 && y < height) {
        const lo = Math.min(x1, x2);
        const hi = Math.max(x1, x2);
        spans[y] = spans[y] ? [Math.min(spans[y][0], lo), Math.max(spans[y][1], hi)] : [lo, hi];
      }
      continue;
    }
    const yStart = Math.ceil(Math.min(y1, y2));
    const yEnd = Math.floor(Math.max(y1, y2));
    for (let y = yStart; y <= yEnd; y++) {
      if (y < 0 || y >= height) continue;
      const t = (y - y1) / (y2 - y1);
      const x = x1 + (x2 - x1) * t;
      spans[y] = spans[y] ? [Math.min(spans[y][0], x), Math.max(spans[y][1], x)] : [x, x];
    }
  }
  return spans;
}

// ── どの領域がどの競技かを、五角形の中心から見た向きで決める ──────────
let cxAll = 0;
let cyAll = 0;
let nAll = 0;
for (const comp of wedgeComponents) {
  for (const [x, y] of comp.pixels) {
    cxAll += x;
    cyAll += y;
    nAll++;
  }
}
const center = [cxAll / nAll, cyAll / nAll];

// ロゴ実物の配置（中心から見た角度。画像座標なので Y は下向き）
const DIRECTIONS = [
  { id: "running", deg: -125 }, // 左上
  { id: "fencing", deg: -55 }, // 右上
  { id: "shooting", deg: 15 }, // 右
  { id: "obstacle", deg: 90 }, // 下
  { id: "swimming", deg: 165 }, // 左
];

const measured = wedgeComponents.map((comp) => {
  let sx = 0;
  let sy = 0;
  for (const [x, y] of comp.pixels) {
    sx += x;
    sy += y;
  }
  const cx = sx / comp.pixels.length;
  const cy = sy / comp.pixels.length;
  const deg = (Math.atan2(cy - center[1], cx - center[0]) * 180) / Math.PI;
  return { comp, cx, cy, deg };
});

const assigned = [];
const used = new Set();
for (const dir of DIRECTIONS) {
  let best = null;
  let bestDiff = Infinity;
  for (const m of measured) {
    if (used.has(m.comp.id)) continue;
    let diff = Math.abs(m.deg - dir.deg);
    if (diff > 180) diff = 360 - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      best = m;
    }
  }
  used.add(best.comp.id);
  assigned.push({ id: dir.id, ...best, angleDiff: bestDiff });
  console.log(`${dir.id.padEnd(9)} 角度 ${best.deg.toFixed(0)}° (想定 ${dir.deg}°, 差 ${bestDiff.toFixed(0)}°)`);
}

const worst = Math.max(...assigned.map((a) => a.angleDiff));
if (worst > 30) {
  throw new Error(`面の割り当てが怪しい（最大 ${worst.toFixed(0)}° ずれ）。ロゴの配置を確認すること。`);
}

/*
 * 中央の白い領域（「P」と星がある部分）を検出する。
 *
 * 各面の内側のフチはこの領域に削られて凹んでいる。凸包はそこをまたいでしまうので、
 * 凸包からこの領域を引くことで正しい形になる。
 *
 * 面と面のあいだの隙間は細く、中央の領域は大きいので、
 * 白を十分に収縮させれば隙間だけが途切れて中央の塊が残る。
 * 収縮量は「中心から塗りつぶしても画像の外まで漏れなくなる」ところまで
 * 自動的に増やす（隙間が塞がった＝漏れが止まった、という判定）。
 */
function erode(mask, w, h, r) {
  const tmp = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 1;
      for (let k = -r; k <= r; k++) {
        const nx = x + k;
        if (nx < 0 || nx >= w || !mask[y * w + nx]) {
          v = 0;
          break;
        }
      }
      tmp[y * w + x] = v;
    }
  }
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 1;
      for (let k = -r; k <= r; k++) {
        const ny = y + k;
        if (ny < 0 || ny >= h || !tmp[ny * w + x]) {
          v = 0;
          break;
        }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

function dilate(mask, w, h, r) {
  const tmp = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = -r; k <= r; k++) {
        const nx = x + k;
        if (nx >= 0 && nx < w && mask[y * w + nx]) {
          v = 1;
          break;
        }
      }
      tmp[y * w + x] = v;
    }
  }
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = -r; k <= r; k++) {
        const ny = y + k;
        if (ny >= 0 && ny < h && tmp[ny * w + x]) {
          v = 1;
          break;
        }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

function floodFrom(mask, w, h, sx, sy) {
  const seen = new Uint8Array(w * h);
  if (!mask[sy * w + sx]) return { seen, leaked: false, size: 0 };
  const stack = [sy * w + sx];
  seen[sy * w + sx] = 1;
  let leaked = false;
  let size = 0;
  while (stack.length) {
    const p = stack.pop();
    size++;
    const px = p % w;
    const py = (p / w) | 0;
    if (px <= 1 || py <= 1 || px >= w - 2 || py >= h - 2) leaked = true;
    const push = (nx, ny) => {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;
      const np = ny * w + nx;
      if (seen[np] || !mask[np]) return;
      seen[np] = 1;
      stack.push(np);
    };
    push(px + 1, py);
    push(px - 1, py);
    push(px, py + 1);
    push(px, py - 1);
  }
  return { seen, leaked, size };
}

const whiteMask = new Uint8Array(regionW * regionH);
for (let y = 0; y < regionH; y++) {
  for (let x = 0; x < regionW; x++) {
    if (isBg(leftX + x, markTop + y)) whiteMask[y * regionW + x] = 1;
  }
}

const seedX = Math.round(center[0]);
const seedY = Math.round(center[1]);

let centralRegion = null;
for (let r = 2; r <= 40; r += 2) {
  const eroded = erode(whiteMask, regionW, regionH, r);
  // 中心そのものは「P」の上にあることがあるので、白い画素を近くから探す
  let sx = seedX;
  let sy = seedY;
  if (!eroded[sy * regionW + sx]) {
    let found = false;
    for (let rad = 1; rad < 200 && !found; rad++) {
      for (let a = 0; a < 360 && !found; a += 5) {
        const nx = Math.round(sx + rad * Math.cos((a * Math.PI) / 180));
        const ny = Math.round(sy + rad * Math.sin((a * Math.PI) / 180));
        if (nx < 0 || ny < 0 || nx >= regionW || ny >= regionH) continue;
        if (eroded[ny * regionW + nx]) {
          sx = nx;
          sy = ny;
          found = true;
        }
      }
    }
    if (!found) continue;
  }

  const { seen, leaked, size } = floodFrom(eroded, regionW, regionH, sx, sy);
  if (leaked || size < 500) continue;

  /*
   * 漏れていないだけでは足りない。隙間が塞ぎきれていないと、中央の領域が
   * 隙間を通って面の中の白（選手のシルエット）まで触手のように伸びてしまい、
   * その選手が塗りから抜け落ちる（フェンシングで実際に起きた）。
   *
   * 中央の領域は中心のまわりのまとまった塊のはずなので、
   * 中心からの距離が突出した部分が無いことを条件に加える。
   */
  const dists = [];
  for (let y = 0; y < regionH; y++) {
    for (let x = 0; x < regionW; x++) {
      if (seen[y * regionW + x]) dists.push(Math.hypot(x - center[0], y - center[1]));
    }
  }
  dists.sort((p, q) => p - q);
  const median = dists[Math.floor(dists.length / 2)];
  const max = dists[dists.length - 1];

  if (max > median * 2.2) {
    console.log(
      `  収縮 ${r}px: まだ触手が伸びている (中心からの距離 中央値${median.toFixed(0)} / 最大${max.toFixed(0)})`,
    );
    continue;
  }

  centralRegion = dilate(seen, regionW, regionH, r);
  console.log(
    `中央の白い領域: 収縮 ${r}px で確定 (${size}px, 中心からの距離 中央値${median.toFixed(0)} / 最大${max.toFixed(0)})`,
  );
  break;
}

if (!centralRegion) throw new Error("中央の白い領域を検出できなかった。");

/*
 * 分断された面の破片を拾い直す。
 *
 * 選手のシルエットが面を横切ると、その面がひとつながりでなくなることがある
 * （フェンシングは実際に2つに割れる）。上位5つだけを見ると破片が捨てられ、
 * 塗りに欠けが出る。
 *
 * そこで残りの領域のうち、色がどれかの面と一致するものを吸収する。
 * 中央の「P」は面と同じ紺なので色だけでは区別できないが、
 * 中央の白い領域の中にあるかどうかで弾ける。
 */
const COLOR_LIMIT = 40; // RGB 距離
const ANGLE_LIMIT = 45; // 度。面の方向から離れすぎた破片は別物とみなす
const MIN_FRAGMENT = 500;

const angleOfPoint = (x, y) => (Math.atan2(y - center[1], x - center[0]) * 180) / Math.PI;
const angleGap = (a, b) => {
  let d = Math.abs(a - b);
  return d > 180 ? 360 - d : d;
};

const wedgeColors = assigned.map((a) => {
  const d = describe(a.comp);
  return { a, rgb: d.rgb, deg: angleOfPoint(d.cx, d.cy) };
});

for (const comp of components) {
  if (wedgeComponents.includes(comp)) continue;
  if (comp.pixels.length < MIN_FRAGMENT) continue;

  const d = describe(comp);
  const inCentral = centralRegion[Math.round(d.cy) * regionW + Math.round(d.cx)] === 1;
  if (inCentral) continue;

  const deg = angleOfPoint(d.cx, d.cy);

  let best = null;
  let bestDist = Infinity;
  for (const w of wedgeColors) {
    // 色が近くても、その面と違う方向にあるものは別物（中央の飾りなど）
    if (angleGap(deg, w.deg) > ANGLE_LIMIT) continue;
    const dist = Math.hypot(d.rgb[0] - w.rgb[0], d.rgb[1] - w.rgb[1], d.rgb[2] - w.rgb[2]);
    if (dist < bestDist) {
      bestDist = dist;
      best = w;
    }
  }

  if (best && bestDist < COLOR_LIMIT) {
    best.a.comp.pixels.push(...comp.pixels);
    console.log(
      `破片を吸収: ${String(comp.pixels.length).padStart(6)}px 色=${d.rgb.join(",")} → ${best.a.id} (色差 ${bestDist.toFixed(0)}, 方向差 ${angleGap(deg, best.deg).toFixed(0)}°)`,
    );
  } else {
    console.log(
      `破片を除外: ${String(comp.pixels.length).padStart(6)}px 色=${d.rgb.join(",")} 方向 ${deg.toFixed(0)}°`,
    );
  }
}

// ── 書き出し ─────────────────────────────────────────────────────────
await mkdir(OUT_ICONS, { recursive: true });

const geometryRows = [];

for (const a of assigned) {
  const hull = convexHull(a.comp.pixels);
  const spans = spansOfHull(hull, regionH);

  // 正方形クロップと同じ座標系のキャンバスに塗る
  const canvas = Buffer.alloc(side * side * 4);
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (let ry = 0; ry < regionH; ry++) {
    const span = spans[ry];
    if (!span) continue;

    for (let rx = Math.round(span[0]); rx <= Math.round(span[1]); rx++) {
      // 中央側は凸包がフチの凹みをまたぐので、中央の白い領域を引く
      if (centralRegion[ry * regionW + rx]) continue;

      const srcX = leftX + rx;
      const srcY = markTop + ry;
      const cx = srcX - sqLeft;
      const cy = srcY - sqTop;
      if (cx < 0 || cy < 0 || cx >= side || cy >= side) continue;
      if (srcX < 0 || srcY < 0 || srcX >= W || srcY >= H) continue;

      const o = (cy * side + cx) * 4;
      const i = idx(srcX, srcY);
      canvas[o] = data[i];
      canvas[o + 1] = data[i + 1];
      canvas[o + 2] = data[i + 2];
      canvas[o + 3] = 255;

      sumX += cx;
      sumY += cy;
      count++;
    }
  }

  await sharp(canvas, { raw: { width: side, height: side, channels: 4 } })
    .resize(512, 512)
    .png()
    .toFile(`${OUT_ICONS}/overlay-${a.id}.png`);

  await sharp(canvas, { raw: { width: side, height: side, channels: 4 } })
    .trim({ threshold: 0 })
    .resize({ width: 256, height: 256, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(`${OUT_ICONS}/${a.id}.png`);

  // 当たり判定に使う輪郭（凸包）と、拡大の基点（塗り領域の重心）
  const points = hull
    .map(([x, y]) => {
      const nx = ((leftX + x - sqLeft) / side) * 100;
      const ny = ((markTop + y - sqTop) / side) * 100;
      return `${nx.toFixed(2)},${ny.toFixed(2)}`;
    })
    .join(" ");

  const gx = ((sumX / count) / side) * 100;
  const gy = ((sumY / count) / side) * 100;

  geometryRows.push(
    `  { id: "${a.id}", points: "${points}", centroid: { x: ${gx.toFixed(2)}, y: ${gy.toFixed(2)} } },`,
  );

  console.log(`✓ ${a.id}.png / overlay-${a.id}.png (頂点${hull.length}点, 重心 ${gx.toFixed(1)},${gy.toFixed(1)})`);
}

await writeFile(
  "src/lib/constants/logo-geometry.ts",
  `// scripts/prepare-logo.mjs が生成。直接編集しないこと。
// logo-mark.png 上での各面の情報（viewBox="0 0 100 100" 基準）。
//   points   … 塗られている領域の輪郭（凸包）。ホバーの当たり判定に使う
//   centroid … 塗られている領域の重心。拡大の基点に使う
import type { DisciplineId } from "@/types";

export const LOGO_WEDGES: {
  id: DisciplineId;
  points: string;
  centroid: { x: number; y: number };
}[] = [
${geometryRows.join("\n")}
];
`,
  "utf8",
);
console.log("✓ src/lib/constants/logo-geometry.ts");

// ── 五角形マークのみ ─────────────────────────────────────────────────
await sharp(SRC)
  .extract({
    left: sqLeft,
    top: sqTop,
    width: Math.min(side, W - sqLeft),
    height: Math.min(side, H - sqTop),
  })
  .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile("public/logo-mark.png");
console.log("✓ logo-mark.png (512x512)");

// ファビコン。src/app/icon.png に置くと Next.js が自動で <link rel="icon"> を出す。
await sharp("public/logo-mark.png").resize(512, 512).png().toFile("src/app/icon.png");
console.log("✓ src/app/icon.png (512x512)");

// ── OGP画像 ─────────────────────────────────────────────────────────
await sharp(SRC)
  .resize(560, 560, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .extend({
    top: 35,
    bottom: 35,
    left: 320,
    right: 320,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .png()
  .toFile("public/og.png");
console.log("✓ og.png (1200x630)");
