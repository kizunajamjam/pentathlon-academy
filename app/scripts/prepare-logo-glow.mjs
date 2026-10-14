/*
 * 黒背景・発光版のロゴ（public/logo.png）から、サイトで使う画像を切り出す。
 *
 *   public/logo-mark.png               五角形マークのみ（正方形・ヘッダー用）
 *   public/icons/{競技}.png            競技アイコン（各面を黒いタイルに載せたもの。角丸は CSS）
 *   public/icons/overlay-{競技}.png    各面をマークと同じ座標に置いたもの（トップの組み上がり用）
 *   public/icons/center-p.png          中央の「P」
 *   public/icons/center-star.png       中央の星
 *   src/app/icon.png / apple-icon.png  ファビコン
 *   public/og.png                      OGP用 1200x630
 *   src/lib/constants/logo-geometry.ts 各面の輪郭と重心、星の位置
 *
 * 実行: node scripts/prepare-logo-glow.mjs
 *
 * ── 面の求め方 ──────────────────────────────────────────────────────
 * 旧ロゴ（白地）用の prepare-logo.mjs は、面のあいだの白い隙間で面を分けていた。
 * 新ロゴは黒地で、面のあいだを発光する金の線がつないでいるので、色で分ける。
 *
 *   1. 各画素を色（金・赤・緑・青）で分類する
 *   2. 色ごとの塗りを少し削る（収縮）。面のフチの細い発光線が切れ、面の本体だけが残る
 *      （金の面はそのままだと、五角形を一周する金の線とつながってしまう）
 *   3. 色ごとに一番大きい塊を面とする。青は2つ（上がランニング、左下が水泳）
 *   4. 塊の凸包を取る。面は凸な四角形なので、中の白い選手のシルエットも含まれる
 *   5. 削った分とフチの発光線の分だけ凸包を外へ広げて、面の範囲とする
 *
 * 面の画像を切るときは、どの画素も一番近い面にだけ入れる。隣の面の色が
 * 混ざらないようにするため。面の外に少し入る黒は、トップのロゴ欄の背景も
 * 同じ黒にしているので見えない。
 *
 * 中央の「P」と星は黒地の上にあるので、明るさをそのまま不透明度にして
 * 抜き出す（黒＝透明）。黒の上に重ねると元の画像と同じ見た目に戻る。
 */
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const SRC = "public/logo.png";
const ORDER = ["fencing", "obstacle", "swimming", "shooting", "running"];
const OUT = 512;

/** 収縮の半径（元画像のpx）。フチの発光線（幅およそ10px）が切れる量。 */
const ERODE = 9;
/** 凸包を外へ広げる量（元画像のpx）。収縮で削った分＋フチの線の半分。 */
const GROW = ERODE + 5;
/** 中央（P・星）の範囲を面からどれだけ離すか（元画像のpx）。面のフチの光を含めないため。 */
const CENTER_GAP = GROW + 10;

// ── 五角形の外接矩形（ワードマークとの間の空行で下端が決まる） ──
const src = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = src.info;
const lit = (x, y) => {
  const i = (y * W + x) * 3;
  return Math.max(src.data[i], src.data[i + 1], src.data[i + 2]) > 90;
};
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
/*
 * 五角形の下の光は、そのまま下のワードマーク（PENTATHLON）の光につながっている。
 * 間でいちばん暗い行で切り、そこから下は黒で消す。残すとマークの下端に線が入る。
 */
const rowMax = (y) => {
  let m = 0;
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    m = Math.max(m, src.data[i], src.data[i + 1], src.data[i + 2]);
  }
  return m;
};
let CUT_BELOW = bottom + 1;
for (let y = bottom + 1; y < Math.min(H, bottom + 50); y++) if (rowMax(y) < rowMax(CUT_BELOW)) CUT_BELOW = y;

/*
 * 正方形の切り出し範囲は、塗りの範囲ではなく外側の光の届く範囲で決める。
 * 塗りの範囲で切ると、左右と上の光が端で切れて、元の画像より欠けて見える。
 */
const GLOW_MIN = 15;
let gl = W;
let gr = 0;
let gt = H;
let gb = 0;
for (let y = 0; y < CUT_BELOW; y++)
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    if (Math.max(src.data[i], src.data[i + 1], src.data[i + 2]) > GLOW_MIN) {
      gl = Math.min(gl, x);
      gr = Math.max(gr, x);
      gt = Math.min(gt, y);
      gb = Math.max(gb, y);
    }
  }
const EDGE = 4; // 光の外側に残す余白
const bw = gr - gl + 1 + EDGE * 2;
const bh = gb - gt + 1 + EDGE * 2;
const S = Math.max(bw, bh); // マークの正方形の一辺（元画像のpx）
const sqLeft = Math.round(gl - EDGE - (S - bw) / 2);
const sqTop = Math.round(gt - EDGE - (S - bh) / 2);
console.log("pentagon bbox:", { left, right, top, bottom }, "glow bbox:", { gl, gr, gt, gb }, { side: S, cut: CUT_BELOW });

// ── マークを正方形で切り出す（元の解像度）──
const cleaned = Buffer.from(src.data);
for (let y = CUT_BELOW; y < H; y++) cleaned.fill(0, y * W * 3, (y + 1) * W * 3);
const pad = Math.max(0, -sqTop, -sqLeft, sqTop + S - H, sqLeft + S - W) + 2;
// sharp は extract を extend より先に処理するので、2段階に分ける
const padded = await sharp(cleaned, { raw: { width: W, height: H, channels: 3 } })
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#000000" })
  .png()
  .toBuffer();
const mark = await sharp(padded)
  .extract({ left: sqLeft + pad, top: sqTop + pad, width: S, height: S })
  .removeAlpha()
  .raw()
  .toBuffer();
if (mark.length !== S * S * 3) throw new Error("マークの切り出しサイズが想定と違う");
const at = (x, y) => {
  const i = (y * S + x) * 3;
  return [mark[i], mark[i + 1], mark[i + 2]];
};

await sharp(mark, { raw: { width: S, height: S, channels: 3 } })
  .resize(OUT, OUT)
  .png()
  .toFile("public/logo-mark.png");

// ── 1. 色で分類 ──
function hsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max === 0 ? 0 : d / max, max / 255];
}
const CLASSES = {
  gold: (h, s, v) => h >= 25 && h <= 58 && s > 0.55 && v > 0.25,
  red: (h, s, v) => (h <= 14 || h >= 340) && s > 0.6 && v > 0.25,
  green: (h, s, v) => h >= 90 && h <= 170 && s > 0.5 && v > 0.12,
  blue: (h, s, v) => h >= 195 && h <= 250 && s > 0.45 && v > 0.15,
};
const masks = {};
for (const name of Object.keys(CLASSES)) masks[name] = new Uint8Array(S * S);
for (let y = 0; y < S; y++)
  for (let x = 0; x < S; x++) {
    const [h, s, v] = hsv(...at(x, y));
    for (const [name, test] of Object.entries(CLASSES)) if (test(h, s, v)) masks[name][y * S + x] = 1;
  }

// ── 2. 収縮 ──
// 窓（一辺 2r+1）のうち FILL 以上が同じ色なら残す。面の質感のむらで所々色が外れるため、
// 「窓がすべて同じ色」だと面の本体まで消える。細い線は窓の大半を占めないので消える。
const FILL = 0.8;
function erode(m, r) {
  const n = S + 1;
  const sat = new Int32Array(n * n); // 2次元の累積和
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++)
      sat[(y + 1) * n + x + 1] = m[y * S + x] + sat[y * n + x + 1] + sat[(y + 1) * n + x] - sat[y * n + x];
  const out = new Uint8Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const x0 = Math.max(0, x - r);
      const y0 = Math.max(0, y - r);
      const x1 = Math.min(S, x + r + 1);
      const y1 = Math.min(S, y + r + 1);
      const sum = sat[y1 * n + x1] - sat[y0 * n + x1] - sat[y1 * n + x0] + sat[y0 * n + x0];
      out[y * S + x] = sum >= FILL * (x1 - x0) * (y1 - y0) ? 1 : 0;
    }
  return out;
}

// ── 3. 連結成分 ──
function components(m) {
  const label = new Int32Array(S * S).fill(-1);
  const comps = [];
  for (let p0 = 0; p0 < S * S; p0++) {
    if (!m[p0] || label[p0] !== -1) continue;
    const pts = [];
    const stack = [p0];
    label[p0] = comps.length;
    while (stack.length) {
      const p = stack.pop();
      const x = p % S;
      const y = (p / S) | 0;
      pts.push([x, y]);
      for (const [nx, ny] of [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= S || ny >= S) continue;
        const np = ny * S + nx;
        if (m[np] && label[np] === -1) {
          label[np] = comps.length;
          stack.push(np);
        }
      }
    }
    comps.push(pts);
  }
  return comps.sort((a, b) => b.length - a.length);
}

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
const meanY = (pts) => pts.reduce((s, p) => s + p[1], 0) / pts.length;



// 選手のシルエットで面が分断されることがあるので、一定以上の大きさの塊はすべて面の一部とする
const MIN_PART = 3000;
const parts = (name) => components(erode(masks[name], ERODE)).filter((c) => c.length >= MIN_PART);
const one = (name) => {
  const ps = parts(name);
  if (!ps.length) throw new Error(`${name} の面を見つけられなかった（ロゴの構造が想定と違う可能性がある）`);
  return convexHull(ps.flat());
};
// 青は2面。五角形の上半分にあるのがランニング、下半分が水泳
const blue = parts("blue");
const upper = blue.filter((c) => meanY(c) < S * 0.42).flat();
const lower = blue.filter((c) => meanY(c) >= S * 0.42).flat();
if (!upper.length || !lower.length) throw new Error("青の面を2つに分けられなかった");
const hulls = {
  fencing: one("gold"),
  shooting: one("red"),
  obstacle: one("green"),
  running: convexHull(upper),
  swimming: convexHull(lower),
};

// ── 点と多角形 ──
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
/** 面の凸包からの距離（内側なら0） */
const dist = (id, x, y) => (inside(hulls[id], x, y) ? 0 : distToPoly(hulls[id], x, y));

// 背景の黒: 画像の端から、暗い画素だけをたどって届く範囲。
// 面の凸包が面のフチより少し外まで広がっている所（ランニングの上辺など）は背景の黒なので、
// 不透明にすると白いページの上で黒い帯に見える。面の中の暗い部分はフチに囲まれていて届かない。
const BG_DARK = 40;
const bgDark = new Uint8Array(S * S);
{
  const stack = [];
  const push = (x, y) => {
    const i = y * S + x;
    if (bgDark[i] || Math.max(...at(x, y)) >= BG_DARK) return;
    bgDark[i] = 1;
    stack.push(x, y);
  };
  for (let x = 0; x < S; x++) {
    push(x, 0);
    push(x, S - 1);
  }
  for (let y = 0; y < S; y++) {
    push(0, y);
    push(S - 1, y);
  }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x > 0) push(x - 1, y);
    if (x < S - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < S - 1) push(x, y + 1);
  }
  // 背景の黒から面のフチまでの暗いぼかし（明るさ BG_FADE 未満）も、数画素ぶんだけ背景とみなす。
  // 深くたどらないので、面の中の暗い色までは届かない。
  const BG_FADE = 80;
  const FADE_DEPTH = 16;
  let front = [];
  for (let i = 0; i < S * S; i++) if (bgDark[i]) front.push(i);
  for (let step = 0; step < FADE_DEPTH && front.length; step++) {
    const next = [];
    for (const i of front) {
      const x = i % S;
      const y = (i - x) / S;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < 0 || ny < 0 || nx >= S || ny >= S) continue;
        const j = ny * S + nx;
        if (bgDark[j] || Math.max(...at(nx, ny)) >= BG_FADE) continue;
        bgDark[j] = 1;
        next.push(j);
      }
    }
    front = next;
  }
}
const isBgDark = (X, Y) => bgDark[Math.min(S - 1, Math.floor(Y)) * S + Math.min(S - 1, Math.floor(X))] === 1;

/**
 * 1画素を書き込む。面の内側は不透明のまま、外側のフチは黒を透明にして光だけ残す
 * （明るさを不透明度にし、黒の上に重ねたとき元の色に戻るよう色を割り戻す）。
 * 戻り値: 書き込んだら true（ほぼ黒で捨てたら false）
 */
function writeGlowPixel(buf, o, r, g, b, opaque) {
  if (opaque) {
    buf[o] = r;
    buf[o + 1] = g;
    buf[o + 2] = b;
    buf[o + 3] = 255;
    return true;
  }
  const a = Math.max(r, g, b);
  if (a < 8) return false;
  buf[o] = Math.min(255, Math.round((r * 255) / a));
  buf[o + 1] = Math.min(255, Math.round((g * 255) / a));
  buf[o + 2] = Math.min(255, Math.round((b * 255) / a));
  buf[o + 3] = a;
  return true;
}

// 五角形全体の輪郭（中央の範囲を決めるのに使う）
const outline = convexHull(ORDER.flatMap((id) => hulls[id]));

// ── 4・5. 各面の画像（出力解像度で、元画像の座標に戻して判定）──
const k = S / OUT;
const outBufs = Object.fromEntries(ORDER.map((id) => [id, Buffer.alloc(OUT * OUT * 4)]));
const small = await sharp(mark, { raw: { width: S, height: S, channels: 3 } }).resize(OUT, OUT).raw().toBuffer();
const sp = (x, y) => {
  const i = (y * OUT + x) * 3;
  return [small[i], small[i + 1], small[i + 2]];
};
// ── 中央の P と星 ──
// 金色（星）か。P は銀色で彩度が低い。
const isGold = (r, g, b) => r > 60 && r - b > 45 && g - b > 20;

// 星の位置: 中央の範囲にある、明るい金色の画素の塊のうち最大のもの
const goldCenter = new Uint8Array(S * S);
for (let y = 0; y < S; y++)
  for (let x = 0; x < S; x++) {
    if (!inside(outline, x, y)) continue;
    if (ORDER.some((id) => dist(id, x, y) <= CENTER_GAP)) continue;
    const [r, g, b] = at(x, y);
    if (isGold(r, g, b) && Math.max(r, g, b) > 120) goldCenter[y * S + x] = 1;
  }
// 星は五角形の中心よりやや下（旧ロゴで マーク上の 52%, 61% 付近）。その近くの塊だけを見る
const near = (c) => {
  const cx = c.reduce((s2, p) => s2 + p[0], 0) / c.length;
  const cy = c.reduce((s2, p) => s2 + p[1], 0) / c.length;
  return Math.hypot(cx - S * 0.52, cy - S * 0.6) < S * 0.12;
};
const starBlob = components(goldCenter).filter(near)[0];
if (!starBlob) throw new Error("星を見つけられなかった");
const starCx = starBlob.reduce((s, p) => s + p[0], 0) / starBlob.length;
const starCy = starBlob.reduce((s, p) => s + p[1], 0) / starBlob.length;
// 星の大きさはマークの一辺のおよそ1割（外接円の半径で 5〜6%）
const starR = S * 0.075;

// 星の本体: 星の塊から、暖色で明るい画素をたどった範囲。面の近く（CENTER_GAP 以内）でも
// たどるので、面のフチに近い星の先も星に入る。銀色の P や、黒いすき間の向こうの金のフチは含まない。
const starMask = new Uint8Array(S * S);
{
  const stack = [];
  for (const [x, y] of starBlob) {
    starMask[y * S + x] = 1;
    stack.push(x, y);
  }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= S || ny >= S || starMask[ny * S + nx]) continue;
      if (Math.hypot(nx - starCx, ny - starCy) > starR * 1.3) continue;
      if (ORDER.some((id) => dist(id, nx, ny) === 0)) continue;
      const [r, g, b] = at(nx, ny);
      if (Math.max(r, g, b) <= 90 || r - b < 25) continue;
      starMask[ny * S + nx] = 1;
      stack.push(nx, ny);
    }
  }
}
// 縁の光も星に入るよう少し太らせる
const STAR_PAD = 4;
const dilate = (m, R = STAR_PAD) => {
  const z = new Uint8Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      if (!m[y * S + x]) continue;
      for (let dy = -R; dy <= R; dy++)
        for (let dx = -R; dx <= R; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < S && ny < S && dx * dx + dy * dy <= R * R) z[ny * S + nx] = 1;
        }
    }
  return z;
};
const starZone = dilate(starMask);
// P の本体も同じように、中央の明るい画素から明るい画素をたどる（星は除く）。
// P の先が面の近くまで伸びていても、面のパーツに入らないようにする。
const pMask = new Uint8Array(S * S);
{
  const bright = (x, y) => Math.max(...at(x, y)) > 90;
  // 種は P の塊だけ（中央の明るい塊のうち最大のもの）。面のあいだの金の線から始めないように
  const seed = new Uint8Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      if (starMask[y * S + x] || !inside(outline, x, y) || !bright(x, y)) continue;
      if (ORDER.some((id) => dist(id, x, y) <= CENTER_GAP)) continue;
      seed[y * S + x] = 1;
    }
  const pBlob = components(seed).sort((a, b) => b.length - a.length)[0];
  const stack = [];
  for (const [x, y] of pBlob) {
    pMask[y * S + x] = 1;
    stack.push(x, y);
  }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= S || ny >= S || pMask[ny * S + nx] || starMask[ny * S + nx]) continue;
      if (ORDER.some((id) => dist(id, nx, ny) === 0)) continue;
      if (!bright(nx, ny)) continue;
      pMask[ny * S + nx] = 1;
      stack.push(nx, ny);
    }
  }
}
// P の内側の暗い画素（銀の濃い部分）も P に入れる: 外からたどれない穴を埋める
{
  const outside = new Uint8Array(S * S);
  const stack = [0, 0];
  outside[0] = 1;
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= S || ny >= S) continue;
      const i = ny * S + nx;
      if (outside[i] || pMask[i]) continue;
      outside[i] = 1;
      stack.push(nx, ny);
    }
  }
  for (let i = 0; i < S * S; i++) if (!outside[i]) pMask[i] = 1;
}
const zoneAt = (z, X, Y) => z[Math.min(S - 1, Math.floor(Y)) * S + Math.min(S - 1, Math.floor(X))] === 1;
const inStar = (X, Y) => zoneAt(starZone, X, Y);
const pZone = dilate(pMask);
const inP = (X, Y) => zoneAt(pZone, X, Y);
// P のまわりのやわらかい光（P の層に入れる範囲）
const pGlowZone = dilate(pMask, 14);
// P のフチの光（星の近くでも P に入れる範囲）
const pEdgeZone = dilate(pMask, 8);

// 面の色（緑・青・赤）がはっきりした画素か。金色や銀色は含まない
const isFaceHue = (r, g, b) => {
  const mx = Math.max(r, g, b);
  if (mx - Math.min(r, g, b) < mx * 0.5) return false; // 銀色（P）のような鈍い色は除く
  return (g > r + 20 && g > b + 10) || (b > r + 30 && b > g + 10) || (r > g + 60 && r > b + 40);
};

// 画素をどの層に入れるか: "star" / "p" / null（一番近い面）
// - 星と P の本体（とそのすぐ外の縁）は、面の近くでも中央の層へ
// - 面の色の光は、中央にあっても面の層へ（P や星といっしょに出ると、緑や青のかけらに見える）
// - 中央の残りは、星のまわりなら星、P のまわりなら P。どちらでもない光（面のつなぎ目の光など）は面へ
const centerLayer = (X, Y, r, g, b, bd) => {
  if (bd === 0) return null;
  if (inStar(X, Y)) return "star";
  if (inP(X, Y)) return "p";
  if (isFaceHue(r, g, b) || bd <= CENTER_GAP || !inside(outline, X, Y)) return null;
  if (Math.hypot(X - starCx, Y - starCy) <= starR * 1.3 && !zoneAt(pEdgeZone, X, Y)) return "star";
  if (zoneAt(pGlowZone, X, Y)) return "p";
  return null;
};
const layerOf = new Array(OUT * OUT).fill(null);

const nearest = new Int8Array(OUT * OUT).fill(-1); // その画素が属する面（なければ -1）
const minDist = new Float32Array(OUT * OUT);
for (let y = 0; y < OUT; y++)
  for (let x = 0; x < OUT; x++) {
    const X = (x + 0.5) * k;
    const Y = (y + 0.5) * k;
    let best = -1;
    let bd = Infinity;
    ORDER.forEach((id, n) => {
      const d = dist(id, X, Y);
      if (d < bd) {
        bd = d;
        best = n;
      }
    });
    minDist[y * OUT + x] = bd;
    // P と星の層に回すもの以外は、面の外側の光や面と中央のあいだの金のフチも含めて、
    // すべて一番近い面に入れる。入れ漏らすと、組み上がったロゴが元の画像より欠けて見える。
    const [r, g, b] = sp(x, y);
    const layer = centerLayer(X, Y, r, g, b, bd);
    if (layer) {
      layerOf[y * OUT + x] = layer;
      continue;
    }
    nearest[y * OUT + x] = best;
    const o = (y * OUT + x) * 4;
    // 外側のフチの黒を透明にするのは、ホバーで拡大したとき黒い縁が隣の面にかぶらないようにするため
    writeGlowPixel(outBufs[ORDER[best]], o, r, g, b, bd === 0 && !isBgDark(X, Y));
  }
for (const id of ORDER)
  await sharp(outBufs[id], { raw: { width: OUT, height: OUT, channels: 4 } })
    .png()
    .toFile(`public/icons/overlay-${id}.png`);

// ── 競技アイコン（各面を黒いタイルに載せる）──
// ロゴは黒地の発光デザインなので、面だけを白地に切り抜くと、どこで切っても光の切れ目が雑に見える。
// ヘッダーのロゴと同じく黒い角丸タイルに載せ、面の外側の光もそのまま残す（角丸は CSS 側）。
// 隣の面・中央の P と星の画素は入れない（黒のまま）。
const ICON = 256;
const ICON_GLOW = 40; // 面の外側の光をどこまで残すか（元画像の px）
const ICON_MARGIN = 0.1; // タイルの余白（一辺に対する割合）
for (const id of ORDER) {
  const [x0, y0, x1, y1] = hulls[id].reduce(
    (b2, [x, y]) => [Math.min(b2[0], x), Math.min(b2[1], y), Math.max(b2[2], x), Math.max(b2[3], y)],
    [S, S, 0, 0],
  );
  // 面の外接矩形を中心にした正方形（余白込み）
  const side = Math.max(x1 - x0, y1 - y0) / (1 - ICON_MARGIN * 2);
  const left = Math.round((x0 + x1) / 2 - side / 2);
  const top = Math.round((y0 + y1) / 2 - side / 2);
  const T = Math.round(side);
  const buf = Buffer.alloc(T * T * 3); // 黒で初期化
  for (let yy = 0; yy < T; yy++)
    for (let xx = 0; xx < T; xx++) {
      const x = left + xx;
      const y = top + yy;
      if (x < 0 || y < 0 || x >= S || y >= S) continue;
      const own = dist(id, x, y);
      if (own > ICON_GLOW) continue;
      if (own > 0) {
        if (ORDER.some((o) => o !== id && dist(o, x, y) < own)) continue;
        if (starZone[y * S + x] || pZone[y * S + x]) continue;
      }
      const [r, g, b] = at(x, y);
      // 光の端が急に切れないよう、残す範囲の外寄りでは少しずつ暗くする
      const f = own <= ICON_GLOW - 12 ? 1 : Math.max(0, (ICON_GLOW - own) / 12);
      const o = (yy * T + xx) * 3;
      buf[o] = Math.round(r * f);
      buf[o + 1] = Math.round(g * f);
      buf[o + 2] = Math.round(b * f);
    }
  await sharp(buf, { raw: { width: T, height: T, channels: 3 } })
    .resize(ICON, ICON)
    .png()
    .toFile(`public/icons/${id}.png`);
}

const pBuf = Buffer.alloc(OUT * OUT * 4);
const sBuf = Buffer.alloc(OUT * OUT * 4);
for (let y = 0; y < OUT; y++)
  for (let x = 0; x < OUT; x++) {
    const layer = layerOf[y * OUT + x];
    if (!layer) continue;
    const [r, g, b] = sp(x, y);
    const a = Math.max(r, g, b);
    if (a < 8) continue;
    const buf = layer === "star" ? sBuf : pBuf;
    const o = (y * OUT + x) * 4;
    // 黒の上に重ねたとき元の色に戻るよう、色を不透明度で割り戻す
    buf[o] = Math.min(255, Math.round((r * 255) / a));
    buf[o + 1] = Math.min(255, Math.round((g * 255) / a));
    buf[o + 2] = Math.min(255, Math.round((b * 255) / a));
    buf[o + 3] = a;
  }
await sharp(pBuf, { raw: { width: OUT, height: OUT, channels: 4 } }).png().toFile("public/icons/center-p.png");
await sharp(sBuf, { raw: { width: OUT, height: OUT, channels: 4 } }).png().toFile("public/icons/center-star.png");

// ── 輪郭と重心を書き出す（0〜100）──
const pct = (v) => (v / S) * 100;
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
  const pts = hulls[id].map(([x, y]) => `${f2(pct(x))},${f2(pct(y))}`).join(" ");
  const c = centroid(hulls[id]);
  return `  { id: "${id}", points: "${pts}", centroid: { x: ${f2(pct(c.x))}, y: ${f2(pct(c.y))} } },`;
});
await writeFile(
  "src/lib/constants/logo-geometry.ts",
  `// scripts/prepare-logo-glow.mjs が生成。直接編集しないこと。
// logo-mark.png 上での各面の情報（viewBox="0 0 100 100" 基準）。
//   points   … 面の輪郭（凸包）。ホバーの当たり判定に使う
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
export const LOGO_STAR = { x: ${f2(pct(starCx))}, y: ${f2(pct(starCy))} };
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

console.log("hull points:", Object.fromEntries(ORDER.map((id) => [id, hulls[id].length])));
console.log("star:", { x: pct(starCx), y: pct(starCy) });
console.log("done");
