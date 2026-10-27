import type { MetadataRoute } from "next";

import { NAV_ITEMS } from "@/lib/constants/site";
import { listPublishedNews } from "@/lib/db/news";

// 本番ドメインは NEXT_PUBLIC_SITE_URL で指定する（Netlify の環境変数に設定済み）
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

// 1時間ごとに作り直す。デプロイのときに1回作るだけだと、あとから公開したお知らせが載らない
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // DB に一時的につながらなくても、ビルド（デプロイ）や作り直しを止めないよう、お知らせ抜きで返す
  const news = await listPublishedNews().catch(() => []);

  return [
    ...NAV_ITEMS.map((item) => ({
      url: `${BASE}${item.href}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: item.href === "/" ? 1 : 0.8,
    })),
    // 規約・プライバシーポリシー・募集・スポンサーはヘッダーのナビには載せていない（footer からのみ）ので個別に足す
    {
      url: `${BASE}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${BASE}/recruit`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${BASE}/sponsor`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    ...news.map((n) => ({
      url: `${BASE}/news/${n.id}`,
      lastModified: new Date(n.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
