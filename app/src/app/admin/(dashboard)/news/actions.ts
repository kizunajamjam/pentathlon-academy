"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffForAction } from "@/lib/auth-guard";
import { createNews, deleteNews, getNews, updateNews, type NewsInput } from "@/lib/db/news";
import { deleteNewsImage, uploadNewsImage } from "@/lib/db/news-image";
import { fromDatetimeLocal } from "@/lib/utils/date";
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

  const iso = fromDatetimeLocal(publishedAtLocal);
  if (!iso) return { error: "公開日時の形式が不正です。" as const };

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

  // 画像: 新しく選ばれていればアップロード、「削除」なら外す、どちらでもなければ変更しない
  const input: NewsInput = { ...parsed.input };
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadNewsImage(file);
    if ("error" in uploaded) return { message: uploaded.error };
    input.imageUrl = uploaded.url;
  } else if (formData.get("removeImage") === "on") {
    input.imageUrl = null;
  }

  // 画像を差し替える・外すときは、保存できたあとで前の画像を置き場から消す
  const previousImageUrl =
    id && input.imageUrl !== undefined ? (await getNews(id))?.imageUrl : undefined;

  const { error } = id ? await updateNews(id, input) : await createNews(input);

  if (error) {
    console.error("[admin/news] 保存に失敗", error);
    // 保存できなかったので、いまアップロードした画像はどこからも使われない
    if (input.imageUrl) await deleteNewsImage(input.imageUrl);
    return { message: "保存に失敗しました。時間をおいて再度お試しください。" };
  }

  if (previousImageUrl && previousImageUrl !== input.imageUrl) {
    await deleteNewsImage(previousImageUrl);
  }

  revalidatePublic();
  redirect("/admin/news");
}

export async function removeNews(formData: FormData) {
  const staff = await getStaffForAction();
  if (!staff) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const imageUrl = (await getNews(id))?.imageUrl;
  const { error } = await deleteNews(id);
  if (error) console.error("[admin/news] 削除に失敗", error);
  else await deleteNewsImage(imageUrl);

  revalidatePublic();
  redirect("/admin/news");
}
