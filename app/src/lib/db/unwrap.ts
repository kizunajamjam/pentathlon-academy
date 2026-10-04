import "server-only";

type Result<T> = { data: T | null; error: { message: string } | null };

/*
 * 読み取りクエリの結果を取り出す。
 *
 * error を握りつぶして空配列を返すと、DB 障害のときに
 * 「まだお知らせはありません」と表示されて誰も気づけない。
 * ここでログに残して投げ直し、error.tsx のエラー表示に回す。
 */
export function unwrap<T>(label: string, result: Result<T>): T | null {
  if (result.error) {
    console.error(`[db/${label}] 読み取りに失敗`, result.error);
    throw new Error(`${label} の読み取りに失敗しました`);
  }
  return result.data;
}
