/*
 * 黒地・発光版のロゴ（public/logo.png）から、サイト全体で使う画像を作る。
 *
 *   public/logo-mark.png               五角形マークのみ（正方形・ヘッダー用）
 *   src/app/icon.png / apple-icon.png  ファビコン
 *   public/og.png                      OGP用 1200x630
 *
 * 実行: node scripts/prepare-logo-glow.mjs
 *
 * 競技ごとの面（競技アイコン・トップの組み上がり用の各面・中央の P と星・
 * 当たり判定の座標）は、白地のロゴから scripts/prepare-logo-pieces.mjs で作る。
 * 以前はこのスクリプトが発光版から切り出していたが、光のにじみで縁が甘くなるため移した。
 */
import sharp from "sharp";

const SRC = "public/logo.png";
const OUT = 512;

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

await sharp(mark, { raw: { width: S, height: S, channels: 3 } })
  .resize(OUT, OUT)
  .png()
  .toFile("public/logo-mark.png");

// ── ファビコン・OGP ──
await sharp("public/logo-mark.png").resize(96, 96).png().toFile("src/app/icon.png");
await sharp("public/logo-mark.png").resize(180, 180).png().toFile("src/app/apple-icon.png");
const ogLogo = await sharp(SRC).resize(600, 600, { fit: "contain", background: "#000000" }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#000000" } })
  .composite([{ input: ogLogo, left: 300, top: 15 }])
  .png()
  .toFile("public/og.png");

console.log("done");
