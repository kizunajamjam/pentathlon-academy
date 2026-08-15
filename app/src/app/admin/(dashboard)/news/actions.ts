"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffForAction } from "@/lib/auth-guard";
import { createNews, deleteNews, updateNews } from "@/lib/db/news";
import type { NewsCategory } from "@/types";

export type NewsFormState = { message?: string };

const CATEGORIES: NewsCategory[] = ["notice", "report", "media", "recruit"];

function parse(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "notice") as NewsCategory;
  const body = String(formData.get("body") ?? "").trim();
  const publishedAtLocal = String(formData.get("publishedAt") ?? "");
  const isPublished = formData.get("isPublished") === "on";

  if (!title) return { error: "タイトルを入力してください。" as const };
  if (!CATEGORIES.includes(category)) return { error: "種別を選択してください。" as const };
  if (!publishedAtLocal) return { error: "公開日時を入力してください。" as const };

  // datetime-local は "2026-08-20T10:00"(ローカル時刻)で来る。
  // Date に渡すとサーバーのタイムゾーンで解釈されるため、
  // JST 固定で ISO に変換する。
  const iso = new Date(`${publishedAtLocal}:00+09:00`).toISOString();
  if (Number.isNaN(Date.parse(iso))) return { error: "公開日時の形式が不正です。" as const };

  return { input: { title, category, body, publishedAt: iso, isPublished } };
}

// 公開ページのキャッシュを捨てる。一覧・詳細・トップに出るため。
function revalidatePublic() {
  revalidatePath("/", "layout");
}

export async function saveNews(
  _prev: NewsFormState,
  formData: FormData,
): Promise<NewsFormState> {
  const staff = await getStaffForAction();
  if (!staff) return { message: "権限がありません。再度ログインしてください。" };

  const parsed = parse(formData);
  if ("error" in parsed) return { message: parsed.error };

  const id = String(formData.get("id") ?? "");

  const { error } = id
    ? await updateNews(id, parsed.input)
    : await createNews(parsed.input);

  if (error) {
    console.error("[admin/news] 保存に失敗", error);
    return { message: "保存に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePublic();
  redirect("/admin/news");
}

export async function removeNews(formData: FormData) {
  const staff = await getStaffForAction();
  if (!staff) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await deleteNews(id);
  if (error) console.error("[admin/news] 削除に失敗", error);

  revalidatePublic();
  redirect("/admin/news");
}
