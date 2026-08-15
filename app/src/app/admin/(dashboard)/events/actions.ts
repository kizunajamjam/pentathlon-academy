"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffForAction } from "@/lib/auth-guard";
import { createEvent, deleteEvent, updateEvent } from "@/lib/db/events";
import type { EventCategory } from "@/types";

export type EventFormState = { message?: string };

const CATEGORIES: EventCategory[] = ["competition", "trial", "camp", "openday"];

// datetime-local はローカル時刻の文字列で来るので JST 固定で ISO に変換する。
function toIso(local: string): string | null {
  if (!local) return null;
  const iso = new Date(`${local}:00+09:00`).toISOString();
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

export async function saveEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const staff = await getStaffForAction();
  if (!staff) return { message: "権限がありません。再度ログインしてください。" };

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "competition") as EventCategory;
  const startsAt = toIso(String(formData.get("startsAt") ?? ""));
  const endsAt = toIso(String(formData.get("endsAt") ?? ""));
  const location = String(formData.get("location") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const url = String(formData.get("url") ?? "").trim() || null;
  const isPublished = formData.get("isPublished") === "on";

  if (!title) return { message: "タイトルを入力してください。" };
  if (!CATEGORIES.includes(category)) return { message: "種別を選択してください。" };
  if (!startsAt) return { message: "開催日時を入力してください。" };
  if (endsAt && endsAt < startsAt) {
    return { message: "終了日時は開始日時より後にしてください。" };
  }
  // DB 側にも同じ制約があるので、ここで弾いて分かりやすいメッセージを返す
  if (url && !/^https?:\/\//.test(url)) {
    return { message: "リンクは http:// または https:// から入力してください。" };
  }

  const input = { title, category, startsAt, endsAt, location, description, url, isPublished };
  const id = String(formData.get("id") ?? "");

  const { error } = id ? await updateEvent(id, input) : await createEvent(input);

  if (error) {
    console.error("[admin/events] 保存に失敗", error);
    return { message: "保存に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath("/", "layout");
  redirect("/admin/events");
}

export async function removeEvent(formData: FormData) {
  const staff = await getStaffForAction();
  if (!staff) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await deleteEvent(id);
  if (error) console.error("[admin/events] 削除に失敗", error);

  revalidatePath("/", "layout");
  redirect("/admin/events");
}
