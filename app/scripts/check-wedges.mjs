// ウェッジ版アイコンの検証。選手が「実際の白」か「透明の穴」かを判定する。
// 透明の穴だと白背景では正しく見えるが、色の上に置くと透けてしまう。
import sharp from "sharp";

for (const id of ["fencing", "swimming", "obstacle", "shooting", "running"]) {
  const { data, info } = await sharp(`public/icons/${id}.png`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let opaque = 0;
  let white = 0;
  for (let p = 0; p < info.width * info.height; p++) {
    const o = p * 4;
    if (data[o + 3] > 128) {
      opaque++;
      if (data[o] > 200 && data[o + 1] > 200 && data[o + 2] > 200) white++;
    }
  }
  console.log(
    `${id.padEnd(9)} 不透明=${String(opaque).padStart(6)}  うち白(選手)=${String(white).padStart(5)} (${((white / opaque) * 100).toFixed(1)}%)`,
  );

  // 赤紫の上に載せて、穴が空いていないか目視できるようにする
  await sharp({
    create: { width: info.width, height: info.height, channels: 4, background: "#b0209c" },
  })
    .composite([{ input: `public/icons/${id}.png` }])
    .png()
    .toFile(`../../_wedge-${id}.png`);
}
