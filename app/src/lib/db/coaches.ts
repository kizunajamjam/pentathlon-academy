import "server-only";

import { createClient } from "@/lib/supabase/server";
import { unwrap } from "./unwrap";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { COACHES } from "@/lib/constants/site";
import type { Coach } from "@/types";

type CoachRow = {
  id: string;
  name: string;
  title: string;
  bio: string[];
  sort_order: number;
  is_published: boolean;
};

function mapCoach(row: CoachRow): Coach {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    bio: row.bio,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  };
}

// Supabase 未接続のあいだは、site.ts の初期内容を返す。
const FALLBACK: Coach[] = COACHES.map((c, i) => ({
  id: `seed-${i}`,
  ...c,
  sortOrder: i * 10,
  isPublished: true,
}));

export async function listPublishedCoaches(): Promise<Coach[]> {
  if (!isSupabaseConfigured) return FALLBACK;

  const supabase = await createClient();
  const data = unwrap(
    "coaches",
    await supabase
      .from("coaches")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  );
  return (data ?? []).map(mapCoach);
}

export async function listAllCoaches(): Promise<Coach[]> {
  if (!isSupabaseConfigured) return FALLBACK;

  const supabase = await createClient();
  const data = unwrap(
    "coaches",
    await supabase.from("coaches").select("*").order("sort_order", { ascending: true }),
  );
  return (data ?? []).map(mapCoach);
}

export async function getCoach(id: string): Promise<Coach | null> {
  if (!isSupabaseConfigured) return FALLBACK.find((c) => c.id === id) ?? null;

  const supabase = await createClient();
  const data = unwrap("coaches", await supabase.from("coaches").select("*").eq("id", id).maybeSingle());
  return data ? mapCoach(data) : null;
}

export type CoachInput = Omit<Coach, "id">;

function toRow(input: CoachInput) {
  return {
    name: input.name,
    title: input.title,
    bio: input.bio,
    sort_order: input.sortOrder,
    is_published: input.isPublished,
  };
}

export async function createCoach(input: CoachInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("coaches").insert(toRow(input));
  return { error };
}

export async function updateCoach(id: string, patch: CoachInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("coaches").update(toRow(patch)).eq("id", id);
  return { error };
}

export async function deleteCoach(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("coaches").delete().eq("id", id);
  return { error };
}
