import type { MetadataRoute } from "next";

import { NAV_ITEMS } from "@/lib/constants/site";
import { listPublishedNews } from "@/lib/db/news";

// TODO: 本番ドメインが決まったら NEXT_PUBLIC_SITE_URL を設定する。
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news = await listPublishedNews();

  return [
    ...NAV_ITEMS.map((item) => ({
      url: `${BASE}${item.href}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: item.href === "/" ? 1 : 0.8,
    })),
    ...news.map((n) => ({
      url: `${BASE}/news/${n.id}`,
      lastModified: new Date(n.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
