"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffForAction } from "@/lib/auth-guard";
import { createSlot, deleteSlot, updateSlot } from "@/lib/db/schedule";
import type { DayOfWeek, DisciplineId } from "@/types";

export type SlotFormState = { message?: string };

const DISCIPLINES: DisciplineId[] = ["fencing", "obstacle", "swimming", "shooting", "running"];

export async function saveSlot(
  _prev: SlotFormState,
  formData: FormData,
): Promise<SlotFormState> {
  const staff = await getStaffForAction();
  if (!staff) return { message: "権限がありません。再度ログインしてください。" };

  const dayOfWeek = Number(formData.get("dayOfWeek"));
  // 時刻・クラス名は「個別に相談」の枠もあるため任意項目。空欄は null にする。
  const startTime = String(formData.get("startTime") ?? "").trim() || null;
  const endTime = String(formData.get("endTime") ?? "").trim() || null;
  const className = String(formData.get("className") ?? "").trim() || null;
  const rawDiscipline = String(formData.get("discipline") ?? "");
  const location = String(formData.get("location") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const isActive = formData.get("isActive") === "on";

  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return { message: "曜日を選択してください。" };
  }
  // 時刻は両方入れるか、両方空（個別相談）のどちらか。片方だけは不整合になる。
  if ((startTime === null) !== (endTime === null)) {
    return { message: "開始・終了時刻は両方入力するか、両方空にしてください。" };
  }
  if (startTime && endTime && endTime <= startTime) {
    return { message: "終了時刻は開始時刻より後にしてください。" };
  }

  const discipline = DISCIPLINES.includes(rawDiscipline as DisciplineId)
    ? (rawDiscipline as DisciplineId)
    : null;

  const input = {
    dayOfWeek: dayOfWeek as DayOfWeek,
    startTime,
    endTime,
    className,
    discipline,
    location,
    note,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    isActive,
  };

  const id = String(formData.get("id") ?? "");
  const { error } = id ? await updateSlot(id, input) : await createSlot(input);

  if (error) {
    console.error("[admin/schedule] 保存に失敗", error);
    return { message: "保存に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath("/", "layout");
  redirect("/admin/schedule");
}

export async function removeSlot(formData: FormData) {
  const staff = await getStaffForAction();
  if (!staff) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await deleteSlot(id);
  if (error) console.error("[admin/schedule] 削除に失敗", error);

  revalidatePath("/", "layout");
  redirect("/admin/schedule");
}
