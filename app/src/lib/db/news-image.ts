import "server-only";

import { createClient } from "@/lib/supabase/server";

const BUCKET = "news-images";
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

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
    cacheControl: "31536000",
  });
  if (error) {
    console.error("[news-image] アップロードに失敗", error);
    return { error: "画像のアップロードに失敗しました。" };
  }

  return { url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}
