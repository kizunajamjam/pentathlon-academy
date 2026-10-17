"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffForAction } from "@/lib/auth-guard";
import { createCoach, deleteCoach, updateCoach } from "@/lib/db/coaches";

export type CoachFormState = { message?: string };

export async function saveCoach(
  _prev: CoachFormState,
  formData: FormData,
): Promise<CoachFormState> {
  const staff = await getStaffForAction();
  if (!staff) return { message: "権限がありません。再度ログインしてください。" };

  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  // 1行 = 1項目。空行は捨てる
  const bio = String(formData.get("bio") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const sortOrder = Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  const isPublished = formData.get("isPublished") === "on";

  if (!name) return { message: "氏名を入力してください。" };
  if (!title) return { message: "肩書きを入力してください。" };
  if (!Number.isFinite(sortOrder)) return { message: "表示順は数字で入力してください。" };

  const input = { name, title, bio, sortOrder, isPublished };
  const id = String(formData.get("id") ?? "");
  const { error } = id ? await updateCoach(id, input) : await createCoach(input);

  if (error) {
    console.error("[admin/coaches] 保存に失敗", error);
    return { message: "保存に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath("/", "layout");
  redirect("/admin/coaches");
}

export async function removeCoach(formData: FormData) {
  const staff = await getStaffForAction();
  if (!staff) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await deleteCoach(id);
  if (error) console.error("[admin/coaches] 削除に失敗", error);

  revalidatePath("/", "layout");
  redirect("/admin/coaches");
}
