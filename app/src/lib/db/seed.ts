import type { AcademyEvent, News, ScheduleSlot } from "@/types";

/*
 * ⚠️ 仮データ。Supabase 未接続のあいだ画面を成立させるためだけのもの。
 *
 * 環境変数(NEXT_PUBLIC_SUPABASE_URL / ..._ANON_KEY)を設定すると
 * lib/db/* が DB を参照するようになり、このファイルは使われなくなる。
 * 本番投入時に削除して構わない。
 */

/*
 * お知らせは空にしてある。
 *
 * もともと画面を成立させるための作り話が4件入っていた（夏季合宿の実施、
 * お盆期間の日程変更、地域情報誌への掲載、体験の持ち物案内）。いずれも
 * 実際には無かった出来事で、本物のお知らせとして読めてしまうため消した。
 *
 * 空のときは「お知らせはまだありません。」と出る。
 * 実際の記事は Supabase 接続後に管理画面から入れる。
 */
export const SEED_NEWS: News[] = [];

/*
 * 大会は日本近代五種協会(pentathlon.jp)の公表分を入れている（2026-08-15 時点）。
 * 開始時刻は公表されていないため 00:00(JST) にして「日付のみ」の表示にしている。
 *
 * ⚠️ ここは自動で更新されない。協会の日程は随時変わるので、
 *    Supabase 接続後は管理画面から登録・更新すること。
 *
 * ⚠️ 開催日を過ぎた大会はここに残さないこと。大会ページでは過ぎたものが
 *    「ARCHIVE これまでの実施」に回り、アカデミーが催したかのように
 *    読めてしまう。協会が主催する大会は、出られる予定としてだけ載せる。
 *    （2026-09-27 のブルジャンプCUP2026 は、この理由で削除した）
 *
 * アカデミー自身の体験会・見学会は、日程を決めて開催する形ではなく
 * 随時受付なので、予定としては持たない（ページ側で案内している）。
 */
const jst = (date: string, time = "00:00") => new Date(`${date}T${time}:00+09:00`).toISOString();

export const SEED_EVENTS: AcademyEvent[] = [
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

/*
 * 練習日は基本的に選手と相談のうえで場所・時間を決めるため、固定の時間割ではない。
 * ここに持たせているのは「だいたいこの曜日はこの種目・この場所」という参考情報。
 * startTime / endTime / className はすべて null（＝個別に相談）で統一している。
 *
 * discipline が5種目のどれにも当たらない活動（コオーディネーション、
 * レーザーラン＝射撃+ランニングの複合種目）は discipline を null にし、
 * className に活動名を入れて表示する。
 */
export const SEED_SCHEDULE: ScheduleSlot[] = [
  {
    id: "seed-s1",
    dayOfWeek: 0,
    startTime: null,
    endTime: null,
    className: null,
    discipline: "running",
    location: "森ノ宮キューズモールエアトラック",
    note: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "seed-s2",
    dayOfWeek: 0,
    startTime: null,
    endTime: null,
    className: null,
    discipline: "obstacle",
    location: "玉造公園",
    note: null,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "seed-s3",
    dayOfWeek: 1,
    startTime: null,
    endTime: null,
    className: null,
    discipline: "fencing",
    location: "無畏フェンシングクラブ",
    note: "ファイティング",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "seed-s4",
    dayOfWeek: 2,
    startTime: null,
    endTime: null,
    className: null,
    discipline: "fencing",
    location: "無畏フェンシングクラブ",
    note: "レッスン",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "seed-s5",
    dayOfWeek: 3,
    startTime: null,
    endTime: null,
    className: "コオーディネーション",
    discipline: null,
    location: "大阪城公園",
    note: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "seed-s6",
    dayOfWeek: 4,
    startTime: null,
    endTime: null,
    className: null,
    discipline: "running",
    location: "森ノ宮キューズモールエアトラック",
    note: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "seed-s7",
    dayOfWeek: 5,
    startTime: null,
    endTime: null,
    className: null,
    discipline: "fencing",
    location: "無畏フェンシングクラブ",
    note: "レッスン",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "seed-s8",
    dayOfWeek: 6,
    startTime: null,
    endTime: null,
    className: null,
    discipline: "swimming",
    location: "尼崎スポーツの森",
    note: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "seed-s9",
    dayOfWeek: 6,
    startTime: null,
    endTime: null,
    className: null,
    discipline: "shooting",
    location: "門真市立総合体育館",
    note: null,
    sortOrder: 2,
    isActive: true,
  },
];
