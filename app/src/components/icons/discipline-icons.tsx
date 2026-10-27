import Image from "next/image";

import type { DisciplineId } from "@/types";

/*
 * 五種競技のアイコン。白地のロゴ（assets/logo-flat.jpg）の五角形の各面を、
 * 金の縁ごと切り出したもの（トップのロゴの組み上がりは発光版のまま）。
 * 生成は scripts/prepare-logo-pieces.mjs（ロゴを差し替えたときだけ再実行）。
 *
 * 背景は透明（白地のロゴと同じく、白や淡い色の上に置く前提）。
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
      src={`/icons/${id}.png`}
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    />
  );
}
