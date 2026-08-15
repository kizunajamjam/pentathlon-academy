import "server-only";

import { createClient } from "@/lib/supabase/server";
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

// これから開催されるもの(開催日が今日以降)を古い順に。
export async function listUpcomingEvents(limit?: number): Promise<AcademyEvent[]> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured) {
    const list = SEED_EVENTS.filter((e) => e.startsAt >= now).sort((a, b) =>
      a.startsAt.localeCompare(b.startsAt),
    );
    return limit ? list.slice(0, limit) : list;
  }

  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .gte("starts_at", now)
    .order("starts_at", { ascending: true });

  if (limit) query = query.limit(limit);

  const { data } = await query;
  return (data ?? []).map(mapEvent);
}

// 終了したものを新しい順に。
export async function listPastEvents(limit?: number): Promise<AcademyEvent[]> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured) {
    const list = SEED_EVENTS.filter((e) => e.startsAt < now).sort((a, b) =>
      b.startsAt.localeCompare(a.startsAt),
    );
    return limit ? list.slice(0, limit) : list;
  }

  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .lt("starts_at", now)
    .order("starts_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data } = await query;
  return (data ?? []).map(mapEvent);
}

export async function getEvent(id: string): Promise<AcademyEvent | null> {
  if (!isSupabaseConfigured) {
    return SEED_EVENTS.find((e) => e.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  return data ? mapEvent(data) : null;
}

export async function listAllEvents(): Promise<AcademyEvent[]> {
  if (!isSupabaseConfigured) {
    return [...SEED_EVENTS].sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });

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
