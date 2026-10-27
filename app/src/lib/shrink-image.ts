import { MAX_IMAGE_BYTES } from "@/lib/news-image-limits";

// 縮小後の長い辺。お知らせの本文幅（最大 768px）の2倍強あれば高解像度の画面でも足りる
const MAX_EDGE = 2000;

/*
 * 上限を超える画像を、ブラウザの中で縮小した JPEG に作り直す。
 *
 * スマホで撮った写真は 5MB を超えることが多い。そのまま送ると、サーバーの受け取り上限
 * （next.config.ts の bodySizeLimit）で弾かれて、「4MB 以下に」という案内も出ないまま
 * エラー画面になり、書いていた本文も消える。送る前に縮めておけばそれが起きない。
 * 作り直すと撮影場所などの情報（Exif）も落ちる。
 *
 * 上限以下ならそのまま返す。縮めても上限を超える・読み込めないときは null。
 */
export async function shrinkImageIfNeeded(file: File): Promise<File | null> {
  if (file.size <= MAX_IMAGE_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return null;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob || blob.size > MAX_IMAGE_BYTES) return null;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}
