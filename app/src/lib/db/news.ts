import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SEED_NEWS } from "./seed";
import type { News, NewsCategory } from "@/types";

type NewsRow = {
  id: string;
  title: string;
  category: NewsCategory;
  body: string;
  published_at: string;
  is_published: boolean;
};

function mapNews(row: NewsRow): News {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    body: row.body,
    publishedAt: row.published_at,
    isPublished: row.is_published,
  };
}

// 公開ページ用: 公開済みかつ公開日時が到来しているものだけ。
export async function listPublishedNews(limit?: number): Promise<News[]> {
  if (!isSupabaseConfigured) {
    return limit ? SEED_NEWS.slice(0, limit) : SEED_NEWS;
  }

  const supabase = await createClient();
  let query = supabase
    .from("news")
    .select("*")
    .eq("is_published", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data } = await query;
  return (data ?? []).map(mapNews);
}

export async function getNews(id: string): Promise<News | null> {
  if (!isSupabaseConfigured) {
    return SEED_NEWS.find((n) => n.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("news").select("*").eq("id", id).maybeSingle();
  return data ? mapNews(data) : null;
}

// 管理画面用: 下書きも含めて全件。
export async function listAllNews(): Promise<News[]> {
  if (!isSupabaseConfigured) return SEED_NEWS;

  const supabase = await createClient();
  const { data } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });

  return (data ?? []).map(mapNews);
}

export type NewsInput = {
  title: string;
  category: NewsCategory;
  body: string;
  publishedAt: string;
  isPublished: boolean;
};

export async function createNews(input: NewsInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .insert({
      title: input.title,
      category: input.category,
      body: input.body,
      published_at: input.publishedAt,
      is_published: input.isPublished,
    })
    .select("*")
    .single();

  return { data: data ? mapNews(data) : null, error };
}

export async function updateNews(id: string, patch: NewsInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .update({
      title: patch.title,
      category: patch.category,
      body: patch.body,
      published_at: patch.publishedAt,
      is_published: patch.isPublished,
    })
    .eq("id", id)
    .select("*")
    .single();

  return { data: data ? mapNews(data) : null, error };
}

export async function deleteNews(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("news").delete().eq("id", id);
  return { error };
}
