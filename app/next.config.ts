import path from "node:path";
import type { NextConfig } from "next";

/*
 * STATIC_EXPORT=1 のときだけ、GitHub Pages 用の静的書き出しに切り替える。
 *
 * GitHub Pages は静的ファイルしか配信できないため、この設定では
 * お問い合わせフォーム(Server Actions)と管理画面(動的レンダリング)は動かない。
 * デザインと文言の確認用と割り切っている。
 *
 * 通常のビルド（Vercel 等）はこの分岐を通らないので、全機能がそのまま動く。
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";

// プロジェクトページは https://<user>.github.io/<repo>/ で配信されるため、
// パスの先頭にリポジトリ名が必要になる。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // これを指定しないと、上位ディレクトリの package-lock.json を拾って
  // ワークスペースルートを誤検出する（ビルド時に警告が出る）。
  turbopack: {
    root: path.resolve(__dirname),
  },

  ...(isStaticExport
    ? {
        output: "export" as const,
        basePath,
        // 静的書き出しでは next/image の最適化サーバーが無い
        images: { unoptimized: true },
        // 静的ホスティングでは /path/ の形でないと 404 になりやすい
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
