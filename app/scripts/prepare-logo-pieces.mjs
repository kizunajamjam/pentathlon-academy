/*
 * 白地のロゴ（assets/logo-flat.jpg）から、単独で使う競技アイコンを切り出す。
 *
 *   public/icons/{競技}.png   競技アイコン（各面を金の縁ごと切り抜き、背景は透明）
 *
 * 実行: node scripts/prepare-logo-pieces.mjs   （app/ で実行）
 * 確認用の画像を見たいときは DEBUG_DIR=/tmp/pieces を付ける。
 *
 * トップのロゴ（組み上がる演出・ホバーで拡大する面・中央の P と星・当たり判定の座標）と、
 * ヘッダーのロゴ・ファビコン・OGP は、発光版のロゴから scripts/prepare-logo-glow.mjs で作る。
 *
 * ── 切り抜きの考え方 ────────────────────────────────────────────────
 * 各面は凸な四角形で、面と面のあいだ・中央の黒い五角形とのあいだ・外周を、
 * 幅およそ10pxの金の線が縁取っている。JPEG のにじみに引きずられないよう、
 * 画素の境目をなぞるのではなく、境目に直線を当てはめて多角形として切る。
 *
 *   1. 各画素を色で分類する（フェンシングの濃い金・赤・緑・青・黒・白）
 *   2. 色ごとの塊をまとめ、その凸包に一番よく当てはまる四角形を選ぶ
 *      （中の白い選手のシルエットは凸包に含まれる）
 *   3. 四角形の各辺の近くにある境目の画素に直線を当てはめ直し、角を交点で決める
 *   4. 各辺の外側にある「向かいの直線」（隣の面・中央の黒・ロゴの外周の境目）まで
 *      広げたものを面の範囲とする。金の縁がまるごと面に入る
 *   5. その多角形を 4x4 の超解像で塗り、アンチエイリアスの効いた透明度にする
 *
 * オブスタクルだけは山の先端が中央の黒地へ飛び出しているので、その三角も含める。
 */
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const SRC = "assets/logo-flat.jpg";
const ORDER = ["fencing", "obstacle", "swimming", "shooting", "running"];
/** 切り出しの作業用に、マーク（五角形）を引き直す正方形のサイズ。アイコンはここから縮小する。 */
const OUT = 1024;
/** 競技アイコンの出力サイズと、タイルに対する面の大きさ */
const ICON = 256;
const ICON_FILL = 0.96;
/** ロゴの外周で、白地のにじみを拾わないよう内側へ寄せる量（元画像のpx） */
const OUTER_INSET = 1.5;
/** 隣の面との境で、隣の色を拾わないよう手前で止める量（元画像のpx） */
const SHARED_INSET = 1.0;
const SS = 4;
const DEBUG_DIR = process.env.DEBUG_DIR;

const src = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = src.info;
const px = (x, y) => {
  const i = (y * W + x) * 3;
  return [src.data[i], src.data[i + 1], src.data[i + 2]];
};

// ── 1. 色で分類 ──
function hsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max ? d / max : 0, max / 255];
}

const CLASSES = {
  // フェンシングの面の濃い金。縁の金の線は明るい（v > 0.85）ので含まれない
  gold: (h, s, v) => h >= 38 && h <= 54 && s >= 0.85 && v >= 0.55 && v <= 0.84,
  red: (h, s, v) => (h <= 12 || h >= 345) && s >= 0.6 && v >= 0.4,
  green: (h, s, v) => h >= 100 && h <= 170 && s >= 0.5 && v >= 0.25,
  blue: (h, s, v) => h >= 195 && h <= 240 && s >= 0.6 && v >= 0.3,
  black: (h, s, v) => v <= 0.12,
  white: (h, s, v) => s <= 0.12 && v >= 0.88,
};
const masks = Object.fromEntries(Object.keys(CLASSES).map((k) => [k, new Uint8Array(W * H)]));
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const [h, s, v] = hsv(...px(x, y));
    for (const [k, test] of Object.entries(CLASSES)) if (test(h, s, v)) masks[k][y * W + x] = 1;
  }

function erode(m, r) {
  // 正方形の構造要素で2回に分けて削る（横→縦）
  const tmp = new Uint8Array(W * H);
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    let run = 0;
    for (let x = 0; x < W; x++) {
      run = m[y * W + x] ? run + 1 : 0;
      if (run > 2 * r) tmp[y * W + x - r] = 1;
    }
  }
  for (let x = 0; x < W; x++) {
    let run = 0;
    for (let y = 0; y < H; y++) {
      run = tmp[y * W + x] ? run + 1 : 0;
      if (run > 2 * r) out[(y - r) * W + x] = 1;
    }
  }
  return out;
}

function components(m) {
  const label = new Int32Array(W * H).fill(-1);
  const comps = [];
  const stack = [];
  for (let i = 0; i < W * H; i++) {
    if (!m[i] || label[i] >= 0) continue;
    const pts = [];
    label[i] = comps.length;
    stack.push(i);
    while (stack.length) {
      const j = stack.pop();
      const x = j % W;
      const y = (j - x) / W;
      pts.push([x, y]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const k = ny * W + nx;
        if (m[k] && label[k] < 0) {
          label[k] = comps.length;
          stack.push(k);
        }
      }
    }
    comps.push(pts);
  }
  return comps.sort((a, b) => b.length - a.length);
}

function convexHull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of pts.reverse()) {
    while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// ── 2. 凸包に内接する面積最大の k 角形（凸包の頂点から選ぶ） ──
function bestPolygon(hull, k) {
  const n = hull.length;
  const area2 = (a, b, c) =>
    Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  let best = { area: -1, idx: null };
  // 始点を全部試すと重いので、間引いた始点で DP し、最後に近傍を詰める
  const step = Math.max(1, Math.floor(n / 60));
  for (let s = 0; s < n; s += step) {
    const order = Array.from({ length: n }, (_, i) => hull[(s + i) % n]);
    // dp[j][i]: order[0] から始めて j 個目の頂点が order[i] のときの最大面積（扇形分割）
    const dp = Array.from({ length: k }, () => new Float64Array(n).fill(-Infinity));
    const from = Array.from({ length: k }, () => new Int32Array(n).fill(-1));
    for (let i = 1; i < n; i++) dp[1][i] = 0;
    for (let j = 2; j < k; j++)
      for (let i = j; i < n; i++)
        for (let p = j - 1; p < i; p++) {
          if (dp[j - 1][p] === -Infinity) continue;
          const v = dp[j - 1][p] + area2(order[0], order[p], order[i]);
          if (v > dp[j][i]) {
            dp[j][i] = v;
            from[j][i] = p;
          }
        }
    for (let i = k - 1; i < n; i++)
      if (dp[k - 1][i] > best.area) {
        const idx = [i];
        for (let j = k - 1; j > 1; j--) idx.unshift(from[j][idx[0]]);
        best = { area: dp[k - 1][i], idx: [0, ...idx].map((t) => (s + t) % n) };
      }
  }
  return best.idx.map((i) => hull[i]);
}

// ── 3. 境目の画素に直線を当てはめ直す ──
function boundaryPixels(m, region) {
  const out = [];
  for (const [x, y] of region) {
    if (!m[y * W + x]) continue;
    if (
      x === 0 || y === 0 || x === W - 1 || y === H - 1 ||
      !m[y * W + x - 1] || !m[y * W + x + 1] || !m[(y - 1) * W + x] || !m[(y + 1) * W + x]
    )
      out.push([x, y]);
  }
  return out;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = (v) => Math.hypot(v[0], v[1]);

/** 点群に直線を当てはめる（主成分）。{ p: 通る点, d: 向き } */
function fitLine(points) {
  let mx = 0;
  let my = 0;
  for (const [x, y] of points) {
    mx += x;
    my += y;
  }
  mx /= points.length;
  my /= points.length;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const [x, y] of points) {
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
    sxy += (x - mx) * (y - my);
  }
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return { p: [mx, my], d: [Math.cos(theta), Math.sin(theta)] };
}
const distToLine = (L, q) => {
  const v = sub(q, L.p);
  return Math.abs(v[0] * L.d[1] - v[1] * L.d[0]);
};
function intersect(A, B) {
  const den = A.d[0] * B.d[1] - A.d[1] * B.d[0];
  const v = sub(B.p, A.p);
  const t = (v[0] * B.d[1] - v[1] * B.d[0]) / den;
  return [A.p[0] + A.d[0] * t, A.p[1] + A.d[1] * t];
}

/**
 * 粗い多角形の各辺の近くにある境目の画素で、辺の直線を当てはめ直す。
 * 角の付近（JPEG で丸まる）と、辺から離れた画素（シルエットの輪郭など）は使わない。
 */
function refinePolygon(approx, boundary) {
  const k = approx.length;
  const lines = [];
  for (let e = 0; e < k; e++) {
    const a = approx[e];
    const b = approx[(e + 1) % k];
    const ab = sub(b, a);
    const L = len(ab);
    const d = [ab[0] / L, ab[1] / L];
    let pts = boundary.filter((q) => {
      const v = sub(q, a);
      const t = v[0] * d[0] + v[1] * d[1];
      const off = Math.abs(v[0] * d[1] - v[1] * d[0]);
      return t > 14 && t < L - 14 && off < 6;
    });
    let line = fitLine(pts);
    // 外れ値を落として2回当てはめ直す
    for (const tol of [2, 1.2]) {
      pts = pts.filter((q) => distToLine(line, q) < tol);
      line = fitLine(pts);
    }
    lines.push(line);
  }
  const corners = lines.map((L, e) => intersect(lines[(e - 1 + k) % k], L));
  return { lines, corners };
}

/** 多角形の向きを揃え、各辺に外向きの法線を持たせる */
function withNormals({ corners }) {
  const k = corners.length;
  let area = 0;
  for (let i = 0; i < k; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % k];
    area += a[0] * b[1] - b[0] * a[1];
  }
  // y 軸が下向きなので、area > 0 は時計回り
  const cw = area > 0;
  const edges = [];
  for (let i = 0; i < k; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % k];
    const ab = sub(b, a);
    const L = len(ab);
    const d = [ab[0] / L, ab[1] / L];
    const n = cw ? [d[1], -d[0]] : [-d[1], d[0]];
    edges.push({ a, b, d, n, len: L, mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] });
  }
  return { corners, edges };
}

/**
 * 削った塊の近く（grow px 以内）にある、削る前の同じ色の画素を集める。
 * 削ると細い部分（オブスタクルの山の頂点など）が消えて凸包が欠けるため、元に戻す。
 */
function restore(mask, comp, grow) {
  const near = new Uint8Array(W * H);
  for (const [x, y] of comp) near[y * W + x] = 1;
  // 横→縦の2回で、正方形に grow px 広げる（各画素から一番近い印までの距離で判定）
  const dist = new Float64Array(Math.max(W, H));
  const rows = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    let last = -Infinity;
    for (let x = 0; x < W; x++) {
      if (near[y * W + x]) last = x;
      dist[x] = x - last;
    }
    let next = Infinity;
    for (let x = W - 1; x >= 0; x--) {
      if (near[y * W + x]) next = x;
      if (Math.min(dist[x], next - x) <= grow) rows[y * W + x] = 1;
    }
  }
  const out = [];
  for (let x = 0; x < W; x++) {
    let last = -Infinity;
    for (let y = 0; y < H; y++) {
      if (rows[y * W + x]) last = y;
      dist[y] = y - last;
    }
    let next = Infinity;
    for (let y = H - 1; y >= 0; y--) {
      if (rows[y * W + x]) next = y;
      if (Math.min(dist[y], next - y) <= grow && mask[y * W + x]) out.push([x, y]);
    }
  }
  return out;
}

function fitShape(mask, comp, k) {
  const approx = bestPolygon(convexHull(restore(mask, comp, 7)), k);
  // 境目は削る前のマスクで取る（削ると直線が内側にずれる）
  const box = bbox(approx, 8);
  const region = [];
  for (let y = box.y0; y <= box.y1; y++) for (let x = box.x0; x <= box.x1; x++) region.push([x, y]);
  return withNormals(refinePolygon(approx, boundaryPixels(mask, region)));
}

function bbox(points, pad = 0) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return {
    x0: Math.max(0, Math.floor(Math.min(...xs) - pad)),
    y0: Math.max(0, Math.floor(Math.min(...ys) - pad)),
    x1: Math.min(W - 1, Math.ceil(Math.max(...xs) + pad)),
    y1: Math.min(H - 1, Math.ceil(Math.max(...ys) + pad)),
  };
}

// 色ごとの塊。少し削って、細い線（金の縁や輪郭の黒）でつながった別の塊を切り離す。
// 面の中は白いシルエットや線で複数の塊に分かれることがあるので、五角形の中の
// 大きな塊をまとめて1つの面とする（凸包を取るので、塊の間のすき間は埋まる）
const MIN_PART = 3000;
const meanX = (c) => c.reduce((s, p) => s + p[0], 0) / c.length;
const meanY = (c) => c.reduce((s, p) => s + p[1], 0) / c.length;
const PENTAGON_BOTTOM = H * 0.74; // ワードマーク（PENTATHLON / ACADEMY）より上
const parts = (name, r = 3) =>
  components(erode(masks[name], r)).filter((c) => c.length >= MIN_PART && meanY(c) < PENTAGON_BOTTOM);
const merged = (cs) => cs.flat();

// 青は2面（上がランニング、左がスイミング）。一番大きい2つの塊を核にして、残りを近いほうへ振り分ける
const blueParts = parts("blue");
const [b1, b2] = blueParts.slice(0, 2).sort((a, b) => meanY(a) - meanY(b));
const runningParts = [];
const swimmingParts = [];
for (const c of blueParts) {
  const d1 = Math.hypot(meanX(c) - meanX(b1), meanY(c) - meanY(b1));
  const d2 = Math.hypot(meanX(c) - meanX(b2), meanY(c) - meanY(b2));
  (d1 <= d2 ? runningParts : swimmingParts).push(c);
}
const shapes = {
  fencing: fitShape(masks.gold, merged(parts("gold")), 4),
  shooting: fitShape(masks.red, merged(parts("red")), 4),
  obstacle: fitShape(masks.green, merged(parts("green")), 4),
  running: fitShape(masks.blue, merged(runningParts), 4),
  swimming: fitShape(masks.blue, merged(swimmingParts), 4),
};

// 中央の黒い五角形。画像の中央に一番近い黒の塊
const blackParts = parts("black", 2);
const cx0 = W / 2;
const cy0 = H * 0.4;
const centerComp = blackParts
  .map((c) => ({ c, d: Math.hypot(c.reduce((s, p) => s + p[0], 0) / c.length - cx0, meanY(c) - cy0) }))
  .sort((a, b) => a.d - b.d)[0].c;
const center = fitShape(masks.black, centerComp, 5);

// ロゴの外周。白地（画像の端からつながる白）以外を前景とする
const bg = new Uint8Array(W * H);
{
  const stack = [0, W - 1, (H - 1) * W, H * W - 1];
  for (const i of stack) bg[i] = 1;
  while (stack.length) {
    const j = stack.pop();
    const x = j % W;
    const y = (j - x) / W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const k = ny * W + nx;
      if (!bg[k] && masks.white[k]) {
        bg[k] = 1;
        stack.push(k);
      }
    }
  }
}
const fg = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) fg[i] = bg[i] ? 0 : 1;
// 前景の塊のうち、五角形（下のワードマークとは白地で離れている）
const pentagonComp = components(erode(fg, 2))
  .map((c) => ({ c, y: meanY(c) }))
  .filter(({ c }) => c.length > 100000)
  .sort((a, b) => a.y - b.y)[0].c;
const outer = fitShape(fg, pentagonComp, 5);

// ── 4. 各辺の「向かいの直線」まで広げる ──
const allEdges = [
  ...Object.entries(shapes).flatMap(([id, s]) => s.edges.map((e) => ({ owner: id, e, kind: "shared" }))),
  ...center.edges.map((e) => ({ owner: "center", e, kind: "shared" })),
  ...outer.edges.map((e) => ({ owner: "outer", e, kind: "outer" })),
];

function farLine(id, edge) {
  let best = null;
  for (const cand of allEdges) {
    if (cand.owner === id) continue;
    const c = cand.e;
    const cosang = Math.abs(edge.d[0] * c.d[0] + edge.d[1] * c.d[1]);
    if (cosang < Math.cos((8 * Math.PI) / 180)) continue;
    // 辺の中点から外向きに進んで、候補の直線に当たるまでの距離
    const v = sub(c.a, edge.mid);
    const denom = edge.n[0] * c.n[0] + edge.n[1] * c.n[1];
    const dist = (v[0] * c.n[0] + v[1] * c.n[1]) / denom;
    if (dist < 3 || dist > 25) continue;
    // 候補の辺が、こちらの辺の中点の向かいにあること
    const hit = [edge.mid[0] + edge.n[0] * dist, edge.mid[1] + edge.n[1] * dist];
    const t = (hit[0] - c.a[0]) * c.d[0] + (hit[1] - c.a[1]) * c.d[1];
    if (t < -10 || t > c.len + 10) continue;
    if (!best || dist < best.dist) best = { dist, cand };
  }
  if (!best) throw new Error(`${id} の辺の向かいが見つかりません`);
  const inset = best.cand.kind === "outer" ? OUTER_INSET : SHARED_INSET;
  // 向かいの境目の直線（境目の画素の中心を通る）から inset だけ手前を、面の辺とする。
  // 向きは向かいの直線に合わせる（金の線の幅がわずかに変わっていても縁に沿う）
  const c = best.cand.e;
  return {
    line: { p: [c.a[0] - edge.n[0] * inset, c.a[1] - edge.n[1] * inset], d: c.d },
    far: best.cand.owner,
    width: best.dist,
  };
}

const pieces = {};
for (const id of ORDER) {
  const s = shapes[id];
  const far = s.edges.map((e) => farLine(id, e));
  const lines = far.map((f) => f.line);
  const k = lines.length;
  const corners = lines.map((L, e) => intersect(lines[(e - 1 + k) % k], L));
  pieces[id] = withNormals({ lines, corners });
  console.log(
    id,
    "縁の幅:",
    far.map((f) => `${f.far}:${f.width.toFixed(1)}px`).join(" "),
  );
}

// ── マークの正方形（外周の外接矩形＋少しの余白） ──
const ob = bbox(outer.corners);
const MARGIN = 6;
const S = Math.max(ob.x1 - ob.x0, ob.y1 - ob.y0) + MARGIN * 2;
const sqLeft = (ob.x0 + ob.x1) / 2 - S / 2;
const sqTop = (ob.y0 + ob.y1) / 2 - S / 2;

// 元画像を、マークの正方形・出力解像度に引き直す（色はここから取る）
const L0 = Math.round(sqLeft);
const T0 = Math.round(sqTop);
const Sr = Math.round(S);
// 正方形が元画像の上端からはみ出すので、白で継ぎ足してから切る
// （sharp は1回の処理だと extend を切り出しのあとに行うため、2回に分ける）
const PAD = 100;
const padded = await sharp(SRC)
  .removeAlpha()
  .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: "#ffffff" })
  .png()
  .toBuffer();
const markImg = await sharp(padded)
  .extract({ left: L0 + PAD, top: T0 + PAD, width: Sr, height: Sr })
  .resize(OUT, OUT, { kernel: "lanczos3" })
  .raw()
  .toBuffer();
// 出力座標 → 元画像の座標（引き直しに使った整数の原点に合わせる）
const toSrc = (X, Y) => [L0 + (X / OUT) * Sr, T0 + (Y / OUT) * Sr];
const toOut = ([x, y]) => [((x - L0) / Sr) * OUT, ((y - T0) / Sr) * OUT];

/** 凸多角形の塗り（出力解像度、4x4 の超解像）。透明度 0〜255 を返す */
function coverage(poly) {
  const cov = new Uint8Array(OUT * OUT);
  const outPoly = poly.corners.map(toOut);
  const box = bbox(outPoly, 2);
  const edges = outPoly.map((a, i) => {
    const b = outPoly[(i + 1) % outPoly.length];
    return [a, b];
  });
  // 時計回り・反時計回りどちらでも判定できるよう符号を揃える
  const sign = Math.sign(
    outPoly.reduce((s, a, i) => {
      const b = outPoly[(i + 1) % outPoly.length];
      return s + a[0] * b[1] - b[0] * a[1];
    }, 0),
  );
  const inside = (x, y) =>
    edges.every(([a, b]) => sign * ((b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])) >= 0);
  for (let Y = box.y0; Y <= Math.min(OUT - 1, box.y1); Y++)
    for (let X = box.x0; X <= Math.min(OUT - 1, box.x1); X++) {
      let n = 0;
      for (let j = 0; j < SS; j++)
        for (let i = 0; i < SS; i++) if (inside(X + (i + 0.5) / SS, Y + (j + 0.5) / SS)) n++;
      cov[Y * OUT + X] = Math.round((n / (SS * SS)) * 255);
    }
  return cov;
}

/*
 * 五角形の頂点では、面の外側の辺と隣の面との境の直線の交点が、頂点の外へ
 * わずかにはみ出す（白地が入る）。ロゴの外周で切りそろえ、さらに外周の近くでは
 * 白地のにじみを透明にする（外周の細い黒のふちは残る）。
 */
const outerInset = (() => {
  const ls = outer.edges.map((e) => ({
    p: [e.a[0] - e.n[0] * OUTER_INSET, e.a[1] - e.n[1] * OUTER_INSET],
    d: e.d,
  }));
  return withNormals({ lines: ls, corners: ls.map((L, i) => intersect(ls[(i - 1 + ls.length) % ls.length], L)) });
})();
const outerCov = coverage(outerInset);
const NEAR_OUTER = 4; // 外周からこの距離（元画像のpx）以内だけ、白のにじみを消す
const whiteMatte = new Uint8Array(OUT * OUT).fill(255);
for (let Y = 0; Y < OUT; Y++)
  for (let X = 0; X < OUT; X++) {
    const [x, y] = toSrc(X + 0.5, Y + 0.5);
    const d = Math.max(...outer.edges.map((e) => (x - e.a[0]) * e.n[0] + (y - e.a[1]) * e.n[1]));
    if (d < -NEAR_OUTER) continue;
    const i = Y * OUT + X;
    const m = Math.min(markImg[i * 3], markImg[i * 3 + 1], markImg[i * 3 + 2]);
    // 一番暗いチャンネルが明るいほど白に近い。金の縁（青が低い）は残る
    whiteMatte[i] = Math.round(255 * Math.min(1, Math.max(0, (235 - m) / 60)));
  }

/*
 * オブスタクルの面だけは四角形ではない。緑の山の先端が、四角形の右上の角から
 * 中央の黒地へ小さな三角として飛び出している（金の縁はなく、黒地に直接接する）。
 * 四角形に、先端を含む三角形を足し、その三角形の中では「黒地でない画素」だけを残す。
 * 右隣の射撃の面（金の縁を含む）にかかる部分は除く。
 */
function obstaclePeak(shootingCov) {
  const P = pieces.obstacle;
  // 四角形の右上の角 = 上の辺と右の辺の交点。上の辺の向きに沿って先端が伸びる
  const top = P.edges.reduce((a, e) => (e.mid[1] < a.mid[1] ? e : a));
  const ti = P.edges.indexOf(top);
  const right = P.edges[(ti + 1) % P.edges.length];
  const corner = top.b;
  const along = [corner[0] + top.d[0] * 45, corner[1] + top.d[1] * 45];
  // 射撃の面の、中央寄りの下の角（緑の山の右の付け根）まで
  const notch = shapes.shooting.corners.reduce((a, c) => (Math.hypot(c[0] - corner[0], c[1] - corner[1]) < Math.hypot(a[0] - corner[0], a[1] - corner[1]) ? c : a));
  const tri = withNormals({ lines: [], corners: [corner, along, [notch[0] + right.d[0] * 6, notch[1] + right.d[1] * 6]] });
  const triCov = coverage(tri);
  const out = new Uint8Array(OUT * OUT);
  for (let i = 0; i < OUT * OUT; i++) {
    if (!triCov[i]) continue;
    const m = Math.max(markImg[i * 3], markImg[i * 3 + 1], markImg[i * 3 + 2]);
    const notBlack = Math.min(1, Math.max(0, (m - 14) / 36));
    out[i] = Math.round(triCov[i] * notBlack * (1 - shootingCov[i] / 255));
  }
  return out;
}

await mkdir("public/icons", { recursive: true });
const overlays = {};
const shootingCov = coverage(pieces.shooting);
for (const id of ORDER) {
  const cov = coverage(pieces[id]);
  if (id === "obstacle") {
    const peak = obstaclePeak(shootingCov);
    for (let i = 0; i < OUT * OUT; i++) cov[i] = Math.max(cov[i], peak[i]);
  }
  for (let i = 0; i < OUT * OUT; i++) cov[i] = Math.round((cov[i] * outerCov[i] * whiteMatte[i]) / 65025);
  const buf = Buffer.alloc(OUT * OUT * 4);
  for (let i = 0; i < OUT * OUT; i++) {
    // 透明な画素は色を持たせない（PNG が小さくなる）
    if (!cov[i]) continue;
    buf[i * 4] = markImg[i * 3];
    buf[i * 4 + 1] = markImg[i * 3 + 1];
    buf[i * 4 + 2] = markImg[i * 3 + 2];
    buf[i * 4 + 3] = cov[i];
  }
  overlays[id] = buf;
}

function alphaBox(buf) {
  let x0 = OUT;
  let y0 = OUT;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < OUT; y++)
    for (let x = 0; x < OUT; x++)
      if (buf[(y * OUT + x) * 4 + 3]) {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
  return { x0, y0, x1, y1 };
}

// ── 競技アイコン（各面を透明の正方形の中央に置く） ──
for (const id of ORDER) {
  // 切り出す範囲は、実際に塗った範囲（透明でない画素）から取る。
  // 四角形の角だけで決めると、オブスタクルの山の先端（四角形の外）が欠ける
  const box = alphaBox(overlays[id]);
  const w = box.x1 + 1 - box.x0;
  const h = box.y1 + 1 - box.y0;
  const target = Math.round(ICON * ICON_FILL);
  const scale = target / Math.max(w, h);
  const rw = Math.round(w * scale);
  const rh = Math.round(h * scale);
  const piece = await sharp(overlays[id], { raw: { width: OUT, height: OUT, channels: 4 } })
    .extract({ left: box.x0, top: box.y0, width: w, height: h })
    .resize(rw, rh, { kernel: "lanczos3" })
    .png()
    .toBuffer();
  await sharp({ create: { width: ICON, height: ICON, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: piece, left: Math.round((ICON - rw) / 2), top: Math.round((ICON - rh) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(`public/icons/${id}.png`);
}

// ── 確認用：検出した多角形を元画像に描く ──
if (DEBUG_DIR) {
  await mkdir(DEBUG_DIR, { recursive: true });
  const poly = (corners, color) =>
    `<polygon points="${corners.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${color}" stroke-width="1"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${[
    ...ORDER.map((id) => poly(shapes[id].corners, "#ff00ff")),
    ...ORDER.map((id) => poly(pieces[id].corners, "#00ffff")),
    poly(center.corners, "#ff00ff"),
    poly(outer.corners, "#00ff00"),
  ].join("")}</svg>`;
  await sharp(SRC)
    .composite([{ input: Buffer.from(svg) }])
    .png()
    .toFile(`${DEBUG_DIR}/polygons.png`);
  // 組み上げ確認：黒地に全部の面を重ねる
  await sharp({ create: { width: OUT, height: OUT, channels: 3, background: "#000000" } })
    .composite(ORDER.map((id) => ({ input: overlays[id], raw: { width: OUT, height: OUT, channels: 4 } })))
    .png()
    .toFile(`${DEBUG_DIR}/assembled.png`);
  console.log(`確認用の画像: ${DEBUG_DIR}`);
}
