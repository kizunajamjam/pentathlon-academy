import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

// 静的書き出し（GitHub Pages）ではビルド時に固定する必要がある
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  /*
   * 確認用プレビュー（GitHub Pages）は検索させない。
   * 仮の連絡先や仮テキストのまま公開しているため、
   * 検索結果に出て本番サイトと混同されるのを避ける。
   */
  if (process.env.NEXT_PUBLIC_IS_PREVIEW === "1") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 管理画面は検索結果に出さない
      disallow: "/admin",
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
