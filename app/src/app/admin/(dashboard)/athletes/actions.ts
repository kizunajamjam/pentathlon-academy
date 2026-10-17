"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffForAction } from "@/lib/auth-guard";
import { createAthlete, deleteAthlete, updateAthlete } from "@/lib/db/athletes";
import { DISCIPLINES } from "@/lib/constants/site";
import type { AthleteRecord, DisciplineId } from "@/types";

export type AthleteFormState = { message?: string };

// 「種目 | 記録」を1行ずつ。区切りは半角の | か全角の ｜
function parseRecords(text: string): AthleteRecord[] | null {
  const records: AthleteRecord[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const [event, time] = line.split(/\s*[|｜]\s*/);
    if (!event || !time) return null;
    records.push({ event, time });
  }
  return records;
}

export async function saveAthlete(
  _prev: AthleteFormState,
  formData: FormData,
): Promise<AthleteFormState> {
  const staff = await getStaffForAction();
  if (!staff) return { message: "権限がありません。再度ログインしてください。" };

  const name = String(formData.get("name") ?? "").trim();
  const discipline = String(formData.get("discipline") ?? "") as DisciplineId;
  const designation = String(formData.get("designation") ?? "").trim();
  const records = parseRecords(String(formData.get("records") ?? ""));
  const sortOrder = Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  const isPublished = formData.get("isPublished") === "on";

  if (!name) return { message: "氏名を入力してください。" };
  if (!DISCIPLINES.some((d) => d.id === discipline)) return { message: "種目を選択してください。" };
  if (!designation) return { message: "指定（例: 水泳S指定）を入力してください。" };
  if (!records) return { message: "記録は「種目 | 記録」の形で1行ずつ入力してください。" };
  if (!Number.isFinite(sortOrder)) return { message: "表示順は数字で入力してください。" };

  const input = { name, discipline, designation, records, sortOrder, isPublished };
  const id = String(formData.get("id") ?? "");
  const { error } = id ? await updateAthlete(id, input) : await createAthlete(input);

  if (error) {
    console.error("[admin/athletes] 保存に失敗", error);
    return { message: "保存に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath("/", "layout");
  redirect("/admin/athletes");
}

export async function removeAthlete(formData: FormData) {
  const staff = await getStaffForAction();
  if (!staff) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await deleteAthlete(id);
  if (error) console.error("[admin/athletes] 削除に失敗", error);

  revalidatePath("/", "layout");
  redirect("/admin/athletes");
}
