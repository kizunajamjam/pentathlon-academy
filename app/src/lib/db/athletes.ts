import "server-only";

import { createClient } from "@/lib/supabase/server";
import { unwrap } from "./unwrap";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ATHLETES } from "@/lib/constants/site";
import type { Athlete, AthleteRecord, DisciplineId } from "@/types";

type AthleteRow = {
  id: string;
  name: string;
  discipline: DisciplineId;
  designation: string;
  records: AthleteRecord[];
  sort_order: number;
  is_published: boolean;
};

function mapAthlete(row: AthleteRow): Athlete {
  return {
    id: row.id,
    name: row.name,
    discipline: row.discipline,
    designation: row.designation,
    records: row.records,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  };
}

// Supabase 未接続のあいだは、site.ts の初期内容を返す。
const FALLBACK: Athlete[] = ATHLETES.map((a, i) => ({
  id: `seed-${i}`,
  ...a,
  sortOrder: i * 10,
  isPublished: true,
}));

export async function listPublishedAthletes(): Promise<Athlete[]> {
  if (!isSupabaseConfigured) return FALLBACK;

  const supabase = await createClient();
  const data = unwrap(
    "athletes",
    await supabase
      .from("athletes")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  );
  return (data ?? []).map(mapAthlete);
}

export async function listAllAthletes(): Promise<Athlete[]> {
  if (!isSupabaseConfigured) return FALLBACK;

  const supabase = await createClient();
  const data = unwrap(
    "athletes",
    await supabase.from("athletes").select("*").order("sort_order", { ascending: true }),
  );
  return (data ?? []).map(mapAthlete);
}

export async function getAthlete(id: string): Promise<Athlete | null> {
  if (!isSupabaseConfigured) return FALLBACK.find((a) => a.id === id) ?? null;

  const supabase = await createClient();
  const data = unwrap(
    "athletes",
    await supabase.from("athletes").select("*").eq("id", id).maybeSingle(),
  );
  return data ? mapAthlete(data) : null;
}

export type AthleteInput = Omit<Athlete, "id">;

function toRow(input: AthleteInput) {
  return {
    name: input.name,
    discipline: input.discipline,
    designation: input.designation,
    records: input.records,
    sort_order: input.sortOrder,
    is_published: input.isPublished,
  };
}

export async function createAthlete(input: AthleteInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("athletes").insert(toRow(input));
  return { error };
}

export async function updateAthlete(id: string, patch: AthleteInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("athletes").update(toRow(patch)).eq("id", id);
  return { error };
}

export async function deleteAthlete(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("athletes").delete().eq("id", id);
  return { error };
}
