import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default function robots(): MetadataRoute.Robots {
  /*
   * 確認用のビルド（NEXT_PUBLIC_IS_PREVIEW=1。仮データで動く）は検索させない。
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
