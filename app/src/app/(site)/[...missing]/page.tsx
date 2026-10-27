import type { Metadata } from "next";
import { notFound } from "next/navigation";

/*
 * どのページにも当たらない URL の受け皿。
 *
 * ここで受けずに Next.js に任せると、404 がルートのレイアウトだけで描かれ、
 * ヘッダー・フッターの無いページになる。(site) の中で notFound() を呼ぶことで、
 * ほかのページと同じヘッダー・フッター付きの 404（app/not-found.tsx）を出す。
 */
export const metadata: Metadata = {
  title: "ページが見つかりません",
};

export default function CatchAllNotFound() {
  notFound();
}
