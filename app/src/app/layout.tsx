import type { Metadata } from "next";

import { SITE } from "@/lib/constants/site";
import "./globals.css";

/*
 * ルートレイアウトは <html>/<body> とフォント読み込みだけを持つ。
 * 公開サイトのヘッダー/フッターは (site)/layout.tsx 側にあり、
 * 管理画面 (admin) はそれとは別のレイアウトを使う。
 *
 * 日本語フォントは next/font/google を使わず <link> で読み込んでいる。
 * next/font は Google Fonts の "japanese" サブセットを扱えず(latin 系のみ)、
 * そのまま使うと日本語がフォールバック表示になってしまうため。
 * <link> 経由なら unicode-range 分割された CSS が配信され、
 * ブラウザが実際に使う範囲だけをダウンロードする。
 */

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"), // TODO: 本番ドメインに差し替え
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    locale: "ja_JP",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
