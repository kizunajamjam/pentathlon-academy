import Image from "next/image";

import { assetPath } from "@/lib/utils/asset";
import type { DisciplineId } from "@/types";

/*
 * 五種競技のアイコン。ロゴ(public/logo.png)の五角形の各面を切り出したもの。
 * 生成は scripts/prepare-logo-glow.mjs（ロゴを差し替えたときだけ再実行）。
 *
 * ロゴは黒地の発光デザインなので、白地に切り抜くとどこで切っても光の切れ目が雑に見える。
 * ヘッダーのロゴと同じく黒い角丸タイルに載せている（画像は黒地の正方形、角丸はここで付ける）。
 * 48px 以下にすると選手のシルエットが潰れて競技を判別できない。
 * 小さく示したい箇所では DISCIPLINES の chip（色の丸）を使う。
 */
export function DisciplineIcon({
  id,
  size = 96,
  className = "",
}: {
  id: DisciplineId;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={assetPath(`/icons/${id}.png`)}
      alt=""
      width={size}
      height={size}
      className={`rounded-[22%] ${className}`}
      aria-hidden="true"
    />
  );
}
