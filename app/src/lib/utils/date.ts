/*
 * 日付整形。
 *
 * サーバーとクライアントで実行環境のタイムゾーンが違うと表示がずれるため、
 * すべて Asia/Tokyo 固定で整形する(Vercel のサーバーは UTC で動くため必須)。
 */
const TZ = "Asia/Tokyo";

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    timeZone: TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateDot(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatWeekday(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", { timeZone: TZ, weekday: "short" });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ja-JP", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/*
 * 開始時刻が未定かどうか。
 *
 * 大会は日程だけ先に決まり、開始時刻が後から出ることが多い。
 * 時刻を 00:00(JST) にしておくと「日付のみ」の表示になる、という約束にしている。
 * 適当な時刻を入れて未定であることを隠さないための仕組み。
 */
function isDateOnly(iso: string): boolean {
  return formatTime(iso) === "00:00";
}

// 開催日時の表示。同日で終了時刻がある場合は "8月20日(木) 10:00〜12:00"、
// 日をまたぐ場合は "8月20日(木) 〜 8月21日(金)" のように出し分ける。
export function formatEventPeriod(startIso: string, endIso: string | null): string {
  const start = new Date(startIso);
  const dateOnly = isDateOnly(startIso);
  const head = dateOnly
    ? `${formatDate(startIso)}(${formatWeekday(startIso)})`
    : `${formatDate(startIso)}(${formatWeekday(startIso)}) ${formatTime(startIso)}`;

  if (!endIso) return head;
  if (dateOnly) {
    const sameDate =
      formatDate(startIso) === formatDate(endIso);
    return sameDate ? head : `${head} 〜 ${formatDate(endIso)}(${formatWeekday(endIso)})`;
  }

  const end = new Date(endIso);
  const sameDay =
    start.toLocaleDateString("ja-JP", { timeZone: TZ }) ===
    end.toLocaleDateString("ja-JP", { timeZone: TZ });

  if (sameDay) return `${head}〜${formatTime(endIso)}`;
  return `${head} 〜 ${formatDate(endIso)}(${formatWeekday(endIso)}) ${formatTime(endIso)}`;
}

// datetime-local 入力用 ("2026-08-20T10:00")。管理画面のフォームで使う。
export function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  // sv-SE は "2026-08-20 10:00" 形式で返るので T 区切りに直す
  return parts.replace(" ", "T");
}
