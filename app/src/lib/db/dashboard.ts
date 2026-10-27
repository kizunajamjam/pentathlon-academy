import "server-only";

import { createClient } from "@/lib/supabase/server";

type CountResult = { count: number | null; error: { message: string } | null };

// 件数だけを数える（行の中身は取らない）。失敗は unwrap と同じく投げてエラー表示に回す
function count(label: string, result: CountResult): number {
  if (result.error) {
    console.error(`[db/${label}] 件数の取得に失敗`, result.error);
    throw new Error(`${label} の件数の取得に失敗しました`);
  }
  return result.count ?? 0;
}

/*
 * 管理画面トップの件数。
 * 以前はお問い合わせの本文まで全件読み込んで数えていた。件数が増えても重くならないよう、
 * データベースに数えさせる。
 */
export async function getDashboardCounts() {
  const supabase = await createClient();
  const head = { count: "exact", head: true } as const;

  const [news, publishedNews, events, inquiries, unhandled] = await Promise.all([
    supabase.from("news").select("id", head),
    supabase.from("news").select("id", head).eq("is_published", true),
    supabase.from("events").select("id", head),
    supabase.from("inquiries").select("id", head),
    supabase.from("inquiries").select("id", head).eq("is_handled", false),
  ]);

  return {
    news: count("news", news),
    publishedNews: count("news", publishedNews),
    events: count("events", events),
    inquiries: count("inquiries", inquiries),
    unhandledInquiries: count("inquiries", unhandled),
  };
}
