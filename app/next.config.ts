import path from "node:path";
import type { NextConfig } from "next";

/*
 * セキュリティ用のレスポンスヘッダー（本番の Netlify 用）。
 *
 * CSP: 読み込んでよい外部の取得先を、実際に使っているものだけに絞る。
 *   - Google Fonts（CSS とフォント）
 *   - Supabase（ログイン・データ・お知らせ画像）
 *   - Cloudflare Turnstile（お問い合わせのスパム対策。設定したときだけ使われる）
 *   - Plausible（アクセス解析。設定したときだけ使われる）
 * Next.js が埋め込む小さなスクリプトがあるため script-src は 'unsafe-inline' を残している。
 * 開発サーバー（next dev）は eval を使うので、開発時だけ 'unsafe-eval' を足す。
 */
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://plausible.io`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // お知らせの画像は Supabase のほか、外部の https 画像を指定できるため https: を許可
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://plausible.io",
  "frame-src https://challenges.cloudflare.com",
  // 他サイトの iframe に埋め込ませない（クリックジャッキング対策）
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // 一度 https で来たブラウザには、以後 http で接続させない（2年）
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // 使っている技術をレスポンスで名乗らない
  poweredByHeader: false,

  // これを指定しないと、上位ディレクトリの package-lock.json を拾って
  // ワークスペースルートを誤検出する（ビルド時に警告が出る）。
  turbopack: {
    root: path.resolve(__dirname),
  },

  // お知らせの画像アップロード（上限 4MB）を、Server Action の既定 1MB に阻まれず受けるため。
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // 管理画面は検索結果に出さず、ブラウザや中継サーバーにも保存させない
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
