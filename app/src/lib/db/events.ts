import "server-only";

import { createClient } from "@/lib/supabase/server";
import { unwrap } from "./unwrap";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SEED_EVENTS } from "./seed";
import type { AcademyEvent, EventCategory } from "@/types";

type EventRow = {
  id: string;
  title: string;
  category: EventCategory;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  description: string | null;
  url: string | null;
  is_published: boolean;
};

function mapEvent(row: EventRow): AcademyEvent {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    description: row.description,
    url: row.url,
    isPublished: row.is_published,
  };
}

// 今日(JST)の 00:00。大会当日や複数日開催の途中でも「開催予定」に残すための基準。
function startOfTodayJst(): string {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  return new Date(`${today}T00:00:00+09:00`).toISOString();
}

// これから開催されるもの(最終日が今日以降)を古い順に。
// 静的書き出しではビルド時点で判定されるため、pages.yml で毎日ビルドし直している。
export async function listUpcomingEvents(limit?: number): Promise<AcademyEvent[]> {
  const today = startOfTodayJst();

  if (!isSupabaseConfigured) {
    const list = SEED_EVENTS.filter((e) => (e.endsAt ?? e.startsAt) >= today).sort((a, b) =>
      a.startsAt.localeCompare(b.startsAt),
    );
    return limit ? list.slice(0, limit) : list;
  }

  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .or(`ends_at.gte.${today},and(ends_at.is.null,starts_at.gte.${today})`)
    .order("starts_at", { ascending: true });

  if (limit) query = query.limit(limit);

  const data = unwrap("events", await query);
  return (data ?? []).map(mapEvent);
}

// 過去 months か月以内に終わったものを新しい順に。
// 協会の記事は年をまたいでも残っているが、古いものほどリンク切れの心配が増えるので期間を区切る。
export async function listPastEvents(months = 6): Promise<AcademyEvent[]> {
  const today = startOfTodayJst();
  const since = new Date(today);
  since.setMonth(since.getMonth() - months);
  const from = since.toISOString();

  if (!isSupabaseConfigured) {
    return SEED_EVENTS.filter((e) => (e.endsAt ?? e.startsAt) < today && e.startsAt >= from).sort(
      (a, b) => b.startsAt.localeCompare(a.startsAt),
    );
  }

  const supabase = await createClient();
  const data = unwrap(
    "events",
    await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .gte("starts_at", from)
      .or(`ends_at.lt.${today},and(ends_at.is.null,starts_at.lt.${today})`)
      .order("starts_at", { ascending: false }),
  );
  return (data ?? []).map(mapEvent);
}

export async function getEvent(id: string): Promise<AcademyEvent | null> {
  if (!isSupabaseConfigured) {
    return SEED_EVENTS.find((e) => e.id === id) ?? null;
  }

  const supabase = await createClient();
  const data = unwrap("events", await supabase.from("events").select("*").eq("id", id).maybeSingle());
  return data ? mapEvent(data) : null;
}

export async function listAllEvents(): Promise<AcademyEvent[]> {
  if (!isSupabaseConfigured) {
    return [...SEED_EVENTS].sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  }

  const supabase = await createClient();
  const data = unwrap("events", await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false }));

  return (data ?? []).map(mapEvent);
}

export type EventInput = {
  title: string;
  category: EventCategory;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  description: string | null;
  url: string | null;
  isPublished: boolean;
};

function toRow(input: EventInput) {
  return {
    title: input.title,
    category: input.category,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    location: input.location,
    description: input.description,
    url: input.url,
    is_published: input.isPublished,
  };
}

export async function createEvent(input: EventInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").insert(toRow(input)).select("*").single();
  return { data: data ? mapEvent(data) : null, error };
}

export async function updateEvent(id: string, patch: EventInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .update(toRow(patch))
    .eq("id", id)
    .select("*")
    .single();

  return { data: data ? mapEvent(data) : null, error };
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  return { error };
}
