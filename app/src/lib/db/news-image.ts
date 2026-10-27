import "server-only";

import { createClient } from "@/lib/supabase/server";
import { MAX_IMAGE_BYTES } from "@/lib/news-image-limits";

const BUCKET = "news-images";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// お知らせの画像を Storage に保存し、公開 URL を返す。
export async function uploadNewsImage(
  file: File,
): Promise<{ url: string } | { error: string }> {
  const ext = EXT[file.type];
  if (!ext) return { error: "画像は JPEG・PNG・WebP のいずれかにしてください。" };
  if (file.size > MAX_IMAGE_BYTES) return { error: "画像は 4MB 以下にしてください。" };

  const supabase = await createClient();
  // 日本語などのファイル名は使わず、衝突しない名前にする
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    // 外した・差し替えた画像を消したあと、ブラウザに長く残らないよう1日にとどめる
    cacheControl: "86400",
  });
  if (error) {
    console.error("[news-image] アップロードに失敗", error);
    return { error: "画像のアップロードに失敗しました。" };
  }

  return { url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

/*
 * お知らせの画像を Storage から消す。外した・差し替えた・記事ごと消したときに呼ぶ。
 *
 * 公開の置き場なので、記事から外しただけでは URL を知っている人に見え続ける
 * （掲載の了解を取り下げられた写真などを、本当に見えなくするため）。
 * この置き場の URL でなければ（サイト内に置いた固定の画像など）何もしない。
 * 消せなくても保存自体は済んでいるので、失敗はログに残すだけにする。
 */
export async function deleteNewsImage(url: string | null | undefined): Promise<void> {
  const path = storagePath(url);
  if (!path) return;

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("[news-image] 削除に失敗", error);
  // 許可が足りないと、エラーにならずに0件の削除で終わる（20261027_news_images_select.sql）
  else if (data.length === 0) console.error("[news-image] 削除できたファイルがありません", path);
}

// 公開 URL（…/storage/v1/object/public/news-images/2026/xxxx.jpg）から置き場の中のパスを取り出す
function storagePath(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}
