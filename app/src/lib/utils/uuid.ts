/*
 * DB の id（uuid）として正しい形かどうか。
 *
 * /news/abc のような形の違う値をそのまま DB に渡すと、Postgres が
 * 「uuid として読めない」エラー(22P02)を返し、読み取り失敗として
 * エラー画面（500）になってしまう。形が違う時点で「存在しない」と扱い、404 にする。
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}
