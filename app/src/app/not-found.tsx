import type { Metadata } from "next";

import { NotFoundMessage } from "@/components/ui/not-found-message";

/*
 * 404 ページ（notFound() を呼んだとき・存在しない URL のとき）。
 *
 * Next.js はこれを、呼んだページに近いレイアウトの内側に描く。公開ページなら
 * (site)/layout.tsx のヘッダー・フッターが付くので、ここは本文だけにする。
 * （ルートグループ (site) に not-found.tsx を置いても使われない）
 *
 * どのルートにも当たらない URL も (site)/[...missing] で受けて notFound() するので、
 * 同じくヘッダー・フッター付きで表示される。
 */
export const metadata: Metadata = {
  title: "ページが見つかりません",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col">
      <NotFoundMessage />
    </div>
  );
}
