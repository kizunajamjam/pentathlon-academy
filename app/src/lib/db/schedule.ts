import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SEED_SCHEDULE } from "./seed";
import type { DayOfWeek, DisciplineId, ScheduleSlot } from "@/types";

type ScheduleRow = {
  id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  class_name: string;
  discipline: DisciplineId | null;
  location: string | null;
  note: string | null;
  sort_order: number;
  is_active: boolean;
};

// Postgres の time 型は "17:30:00" で返るため表示用に秒を落とす。
function toHm(t: string): string {
  return t.slice(0, 5);
}

function mapSlot(row: ScheduleRow): ScheduleSlot {
  return {
    id: row.id,
    dayOfWeek: row.day_of_week,
    startTime: toHm(row.start_time),
    endTime: toHm(row.end_time),
    className: row.class_name,
    discipline: row.discipline,
    location: row.location,
    note: row.note,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export async function listActiveSlots(): Promise<ScheduleSlot[]> {
  if (!isSupabaseConfigured) return SEED_SCHEDULE;

  const supabase = await createClient();
  const { data } = await supabase
    .from("schedule_slots")
    .select("*")
    .eq("is_active", true)
    .order("day_of_week", { ascending: true })
    .order("sort_order", { ascending: true });

  return (data ?? []).map(mapSlot);
}

export async function listAllSlots(): Promise<ScheduleSlot[]> {
  if (!isSupabaseConfigured) return SEED_SCHEDULE;

  const supabase = await createClient();
  const { data } = await supabase
    .from("schedule_slots")
    .select("*")
    .order("day_of_week", { ascending: true })
    .order("sort_order", { ascending: true });

  return (data ?? []).map(mapSlot);
}

// 曜日ごとにまとめる。表示側で毎回グルーピングを書かずに済ませるため。
export function groupByDay(slots: ScheduleSlot[]): Map<DayOfWeek, ScheduleSlot[]> {
  const map = new Map<DayOfWeek, ScheduleSlot[]>();
  for (const slot of slots) {
    const list = map.get(slot.dayOfWeek);
    if (list) list.push(slot);
    else map.set(slot.dayOfWeek, [slot]);
  }
  return map;
}

export type ScheduleSlotInput = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  className: string;
  discipline: DisciplineId | null;
  location: string | null;
  note: string | null;
  sortOrder: number;
  isActive: boolean;
};

function toRow(input: ScheduleSlotInput) {
  return {
    day_of_week: input.dayOfWeek,
    start_time: input.startTime,
    end_time: input.endTime,
    class_name: input.className,
    discipline: input.discipline,
    location: input.location,
    note: input.note,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  };
}

export async function createSlot(input: ScheduleSlotInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_slots")
    .insert(toRow(input))
    .select("*")
    .single();

  return { data: data ? mapSlot(data) : null, error };
}

export async function updateSlot(id: string, patch: ScheduleSlotInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_slots")
    .update(toRow(patch))
    .eq("id", id)
    .select("*")
    .single();

  return { data: data ? mapSlot(data) : null, error };
}

export async function deleteSlot(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("schedule_slots").delete().eq("id", id);
  return { error };
}
