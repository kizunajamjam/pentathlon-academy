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
 * 終わった大会（最終日を過ぎたもの）は「開催予定」から外れ、
 * 「過去の大会」に過去半年ぶんだけ出る。半年を過ぎたものは表示されないので、
 * ここから消さなくてよい（pages.yml で毎日ビルドし直して判定を更新している）。
 * アカデミーが催したと読まれないよう、説明文には主催者を明記すること。
 *
 * アカデミー自身の体験会・見学会は、日程を決めて開催する形ではなく
 * 随時受付なので、予定としては持たない（ページ側で案内している）。
 */
const jst = (date: string, time = "00:00") => new Date(`${date}T${time}:00+09:00`).toISOString();

export const SEED_EVENTS: AcademyEvent[] = [
  // ── 過去の大会（過去半年ぶん）──
  {
    id: "seed-p1",
    title: "2026 ジュニア世界選手権大会派遣選考会 兼 シニア記録会",
    category: "competition",
    startsAt: jst("2026-04-29"),
    endsAt: null,
    location: null,
    description: "日本近代五種協会が主催した、ジュニア世界選手権の派遣選考会とシニア記録会です。",
    url: "https://pentathlon.jp/news/%e3%80%90%e3%82%a8%e3%83%b3%e3%83%88%e3%83%aa%e3%83%bc%e5%8f%97%e4%bb%98%e4%b8%ad%e3%80%912026-%e3%82%b8%e3%83%a5%e3%83%8b%e3%82%a2%e4%b8%96%e7%95%8c%e9%81%b8%e6%89%8b%e5%a4%a7%e4%bc%9a%e6%a8%a9/",
    isPublished: true,
  },
  {
    id: "seed-p2",
    title: "ブルジャンプCUP2026 第2回 滋賀県東近江市ラウンド",
    category: "competition",
    startsAt: jst("2026-05-24"),
    endsAt: null,
    location: "滋賀県東近江市",
    description: "日本近代五種協会が主催した近代３種のシリーズ戦です。",
    url: "https://pentathlon.jp/news/%e8%bf%91%e4%bb%a33%e7%a8%ae%e3%82%b7%e3%83%aa%e3%83%bc%e3%82%ba%e3%80%8c%e3%83%96%e3%83%ab%e3%82%b8%e3%83%a3%e3%83%b3%e3%83%97cup2026%e3%80%8d%e9%96%8b%e5%82%ac%e6%b1%ba%e5%ae%9a/",
    isPublished: true,
  },
  {
    id: "seed-p3",
    title: "ブルジャンプCUP2026 第3回 東京都立川市ラウンド",
    category: "competition",
    startsAt: jst("2026-06-28"),
    endsAt: null,
    location: "東京都立川市",
    description: "日本近代五種協会が主催した近代３種のシリーズ戦です。",
    url: "https://pentathlon.jp/news/%e8%bf%91%e4%bb%a33%e7%a8%ae%e3%82%b7%e3%83%aa%e3%83%bc%e3%82%ba%e3%80%8c%e3%83%96%e3%83%ab%e3%82%b8%e3%83%a3%e3%83%b3%e3%83%97cup2026%e3%80%8d%e9%96%8b%e5%82%ac%e6%b1%ba%e5%ae%9a/",
    isPublished: true,
  },
  {
    id: "seed-p4",
    title: "2026 ランキング戦（第1戦）",
    category: "competition",
    startsAt: jst("2026-07-05"),
    endsAt: null,
    location: null,
    description: "日本近代五種協会が主催したランキング戦です。",
    url: "https://pentathlon.jp/news/2026ranking1/",
    isPublished: true,
  },
  {
    id: "seed-p5",
    title: "ブルジャンプCUP2026 第4回 福島県棚倉町ラウンド",
    category: "competition",
    startsAt: jst("2026-09-27"),
    endsAt: null,
    location: "福島県棚倉町",
    description: "日本近代五種協会が主催した近代３種のシリーズ戦です。",
    url: "https://pentathlon.jp/news/%e8%bf%91%e4%bb%a33%e7%a8%ae%e3%82%b7%e3%83%aa%e3%83%bc%e3%82%ba%e3%80%8c%e3%83%96%e3%83%ab%e3%82%b8%e3%83%a3%e3%83%b3%e3%83%97cup2026%e3%80%8d%e9%96%8b%e5%82%ac%e6%b1%ba%e5%ae%9a/",
    isPublished: true,
  },
  // ── 開催予定 ──
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
  {
    id: "seed-e3",
    title: "第66回近代五種全日本選手権大会",
    category: "competition",
    startsAt: jst("2026-11-28"),
    endsAt: jst("2026-11-29"),
    location: "リソルの森メディカルトレーニングセンター（千葉県長生郡）",
    description:
      "日本近代五種協会が主催する近代五種の日本選手権です。エントリー方法や大会要項は協会サイトの記事をご確認ください。",
    url: "https://pentathlon.jp/news/%E7%AC%AC%EF%BC%96%EF%BC%96%E5%9B%9E%E8%BF%91%E4%BB%A3%E4%BA%94%E7%A8%AE%E5%85%A8%E6%97%A5%E6%9C%AC%E9%81%B8%E6%89%8B%E6%A8%A9%E5%A4%A7%E4%BC%9A/",
    isPublished: true,
  },
  {
    id: "seed-e4",
    title: "第13回近代３種日本選手権大会 兼 第20回JOCジュニアオリンピックカップ",
    category: "competition",
    startsAt: jst("2026-11-28"),
    endsAt: null,
    location: "リソルの森メディカルトレーニングセンター（千葉県長生郡）",
    description:
      "日本近代五種協会が主催する近代３種の日本選手権です。エントリーの締切は2026年10月31日（土）23:59です。大会要項は協会サイトの記事をご確認ください。",
    url: "https://pentathlon.jp/news/%E7%AC%AC%EF%BC%96%EF%BC%96%E5%9B%9E%E8%BF%91%E4%BB%A3%E4%BA%94%E7%A8%AE%E5%85%A8%E6%97%A5%E6%9C%AC%E9%81%B8%E6%89%8B%E6%A8%A9%E5%A4%A7%E4%BC%9A/",
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
