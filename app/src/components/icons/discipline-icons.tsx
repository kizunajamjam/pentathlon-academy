import Image from "next/image";

import type { DisciplineId } from "@/types";

/*
 * 五種競技のアイコン。ロゴ(public/logo.png)の五角形の各面を切り出したもの。
 * 生成は scripts/prepare-logo.mjs（ロゴを差し替えたときだけ再実行）。
 *
 * 面の形がそのまま出るので、白いカードなど明るい背景の上に置くこと。
 * 面の境界に白の残りがあり、色地の上では筋として見えてしまう。
 *
 * また 48px 以下にすると選手のシルエットが潰れて競技を判別できない。
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
