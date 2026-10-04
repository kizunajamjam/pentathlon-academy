import type { Metadata } from "next";

import { SITE } from "@/lib/constants/site";
import { LOGO_SEEN_KEY } from "@/lib/logo-assembly";
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
  // 本番ドメインは NEXT_PUBLIC_SITE_URL で指定する（sitemap / robots と共通）
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  // 確認用プレビューは検索結果に出さない（robots.ts も同じ条件で切り替えている）
  ...(process.env.NEXT_PUBLIC_IS_PREVIEW === "1"
    ? { robots: { index: false, follow: false } }
    : {}),
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
    // data-logo-seen は下の先読みスクリプトが描画前に付けるので、
    // サーバーの HTML と食い違っても警告しないようにしている。
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/*
          トップページのロゴが組み上がる区間を、この訪問で既に見ていれば
          最初の描画から畳んでおく（globals.css の data-logo-seen）。
          JavaScript の読み込みを待ってから畳むと、再読み込みや「戻る」で
          ブラウザが戻したスクロール位置が、そのぶんずれてしまう。
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem(${JSON.stringify(LOGO_SEEN_KEY)})==="1")document.documentElement.dataset.logoSeen=""}catch(e){}`,
          }}
        />
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
