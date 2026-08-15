import type { AcademyEvent, News, ScheduleSlot } from "@/types";

/*
 * ⚠️ 仮データ。Supabase 未接続のあいだ画面を成立させるためだけのもの。
 *
 * 環境変数(NEXT_PUBLIC_SUPABASE_URL / ..._ANON_KEY)を設定すると
 * lib/db/* が DB を参照するようになり、このファイルは使われなくなる。
 * 本番投入時に削除して構わない。
 */

// 「今日から n 日後」の ISO 文字列。日付を固定で書くと時間が経つほど
// 「開催予定」が空になってしまうため、相対日付で持たせている。
function days(n: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const SEED_NEWS: News[] = [
  {
    id: "seed-1",
    title: "体験・見学を随時受け付けています",
    category: "recruit",
    body: "体験・見学を随時受け付けています。近代五種がはじめての方でも参加いただけます。\n\n練習スケジュールをご覧のうえ、ご都合のよい曜日・クラスをお知らせください。動きやすい服装と室内シューズをご用意ください。詳しい持ち物はお申し込み後にご案内します。",
    publishedAt: days(-2, 10),
    isPublished: true,
  },
  {
    id: "seed-2",
    title: "夏季合宿を実施しました",
    category: "report",
    body: "2泊3日の夏季合宿を実施しました。水泳とランニングを中心に、レーザーランの実戦形式にも取り組みました。",
    publishedAt: days(-9, 10),
    isPublished: true,
  },
  {
    id: "seed-3",
    title: "お盆期間の練習日程について",
    category: "notice",
    body: "お盆期間中の練習日程を変更いたします。詳細は練習スケジュールのページをご確認ください。",
    publishedAt: days(-16, 10),
    isPublished: true,
  },
  {
    id: "seed-4",
    title: "地域情報誌にアカデミーが掲載されました",
    category: "media",
    body: "地域情報誌にてアカデミーの活動をご紹介いただきました。",
    publishedAt: days(-30, 10),
    isPublished: true,
  },
];

/*
 * 大会は日本近代五種協会(pentathlon.jp)の公表分を入れている（2026-08-15 時点）。
 * 開始時刻は公表されていないため 00:00(JST) にして「日付のみ」の表示にしている。
 *
 * ⚠️ ここは自動で更新されない。協会の日程は随時変わるので、
 *    Supabase 接続後は管理画面から登録・更新すること。
 *
 * アカデミー自身の体験会・見学会は、日程を決めて開催する形ではなく
 * 随時受付なので、予定としては持たない（ページ側で案内している）。
 */
const jst = (date: string, time = "00:00") => new Date(`${date}T${time}:00+09:00`).toISOString();

export const SEED_EVENTS: AcademyEvent[] = [
  {
    id: "seed-e1",
    title: "近代3種シリーズ「ブルジャンプCUP2026」",
    category: "competition",
    startsAt: jst("2026-09-27"),
    endsAt: null,
    location: "福島県棚倉町",
    description:
      "日本近代五種協会が主催する近代3種のシリーズ戦です。五種すべてではなく種目を絞って行われるため、はじめて大会に出る選手にも参加しやすい大会です。",
    url: "https://pentathlon.jp/news/%e8%bf%91%e4%bb%a33%e7%a8%ae%e3%82%b7%e3%83%aa%e3%83%bc%e3%82%ba%e3%80%8c%e3%83%96%e3%83%ab%e3%82%b8%e3%83%a3%e3%83%b3%e3%83%97cup2026%e3%80%8d%e9%96%8b%e5%82%ac%e6%b1%ba%e5%ae%9a/",
    isPublished: true,
  },
  {
    id: "seed-e2",
    title: "2026 ランキング戦（第2戦）",
    category: "competition",
    startsAt: jst("2026-10-12"),
    endsAt: null,
    location: null,
    description:
      "日本近代五種協会が主催するランキング戦です。エントリー方法や実施要項は協会サイトの記事をご確認ください。",
    url: "https://pentathlon.jp/news/2026ranking2/",
    isPublished: true,
  },
];

export const SEED_SCHEDULE: ScheduleSlot[] = [
  {
    id: "seed-s1",
    dayOfWeek: 2,
    startTime: "17:30",
    endTime: "19:00",
    className: "初級クラス",
    discipline: "fencing",
    location: "アカデミー練習場",
    note: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "seed-s2",
    dayOfWeek: 2,
    startTime: "19:00",
    endTime: "20:30",
    className: "選手クラス",
    discipline: "fencing",
    location: "アカデミー練習場",
    note: null,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "seed-s3",
    dayOfWeek: 4,
    startTime: "18:00",
    endTime: "19:30",
    className: "初級クラス",
    discipline: "swimming",
    location: "市民プール",
    note: "送迎はありません",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "seed-s4",
    dayOfWeek: 6,
    startTime: "09:00",
    endTime: "11:00",
    className: "初級クラス",
    discipline: "running",
    location: "市民総合運動公園",
    note: "雨天時は室内練習",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "seed-s5",
    dayOfWeek: 6,
    startTime: "11:00",
    endTime: "12:30",
    className: "選手クラス",
    discipline: "shooting",
    location: "アカデミー練習場",
    note: null,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "seed-s6",
    dayOfWeek: 0,
    startTime: "10:00",
    endTime: "12:00",
    className: "選手クラス",
    discipline: "obstacle",
    location: "○○体育館",
    note: "月2回（第1・第3日曜）",
    sortOrder: 1,
    isActive: true,
  },
];
