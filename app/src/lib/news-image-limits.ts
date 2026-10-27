// お知らせ画像の上限。画面（選んだ時点の確認・縮小）とサーバー（保存前の確認）の両方で使うため、
// server-only の news-image.ts とは分けて置く。
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
