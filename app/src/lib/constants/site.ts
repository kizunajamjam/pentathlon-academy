import type { DisciplineId, EventCategory, NewsCategory } from "@/types";

// ⚠️ 仮テキスト: 正式な文言・数値が決まり次第このファイルを差し替える。
// 表示側のコンポーネントには文言を直書きせず、必ずここを参照させること。
export const SITE = {
  name: "ペンタスロンアカデミー",
  nameEn: "PENTATHLON ACADEMY",
  tagline: "近代五種に、本気で取り組める場所。",
  description:
    "フェンシング・水泳・障害物レース・射撃・ランニング。5種目を一貫して鍛え、世界を目指す選手を育てるアカデミーです。",
  // TODO: 正式な連絡先に差し替える
  email: "info@example.com",
  tel: "000-0000-0000",
  address: "〒000-0000 ○○県○○市○○ 0-0-0",
  instagram: "https://www.instagram.com/pentathlonacademy.jp/",
  instagramHandle: "@pentathlonacademy.jp",
} as const;

/*
 * 強化選手チャレンジ基準（水泳）。
 *
 * 近代五種は水泳が土台になるため、水泳経験者に向けた目安として
 * アカデミーが提示している記録。あくまで目安であって入会条件ではない。
 */
export const SWIM_LEVELS = [
  { label: "ゴールド", sub: "トップレベル" },
  { label: "シルバー", sub: "ハイレベル" },
  { label: "ブロンズ", sub: "チャレンジレベル" },
] as const;

export const SWIM_STANDARDS: {
  gender: "男子" | "女子";
  events: { name: string; times: [string, string, string] }[];
  plus: string[];
}[] = [
  {
    gender: "男子",
    events: [
      { name: "50m 自由形", times: ["24.80", "25.50", "26.30"] },
      { name: "100m 自由形", times: ["53.50", "55.00", "56.50"] },
      { name: "200m 個人メドレー", times: ["2:10.00", "2:18.00", "2:25.00"] },
      { name: "400m 個人メドレー", times: ["4:45.00", "4:58.00", "5:15.00"] },
    ],
    plus: [
      "ランニングが得意",
      "リレーでアンカーの経験がある",
      "身体操作能力が高い（跳ぶ・登る・バランス）",
      "新しい競技への興味がある",
    ],
  },
  {
    gender: "女子",
    events: [
      { name: "50m 自由形", times: ["27.80", "28.60", "29.50"] },
      { name: "100m 自由形", times: ["59.50", "1:01.50", "1:03.50"] },
      { name: "200m 個人メドレー", times: ["2:24.00", "2:32.00", "2:40.00"] },
      { name: "400m 個人メドレー", times: ["5:05.00", "5:20.00", "5:40.00"] },
    ],
    plus: [
      "ランニングが好き",
      "身体操作能力が高い（跳ぶ・登る・バランス）",
      "継続して練習できる",
      "チャレンジ精神がある",
    ],
  },
];

export const NAV_ITEMS = [
  { href: "/", label: "トップ", labelEn: "HOME" },
  { href: "/about", label: "アカデミーについて", labelEn: "ABOUT" },
  { href: "/disciplines", label: "近代五種競技", labelEn: "DISCIPLINES" },
  { href: "/schedule", label: "練習スケジュール", labelEn: "SCHEDULE" },
  { href: "/events", label: "大会・イベント", labelEn: "EVENTS" },
  { href: "/news", label: "お知らせ", labelEn: "NEWS" },
  { href: "/contact", label: "お問い合わせ", labelEn: "CONTACT" },
] as const;

// 競技ごとの表示情報。色はロゴの五角形の各面から取っている。
//
// 並び順は、2列グリッドに流し込んだときロゴの五角形と上下左右が
// 一致するようにしている。
//
//   1行目: ランニング(左上) / フェンシング(右上)
//   2行目: 水泳(左)         / 射撃(右)
//   3行目: 障害物レース(下・中央寄せ)
//
// この配列の順序がトップページのカード、競技紹介ページの 01〜05、
// 管理画面の種目プルダウンにそのまま反映される。
//
// tailwind のクラス名は文字列結合で生成すると purge されるため、完全な形で持つ。
export const DISCIPLINES: {
  id: DisciplineId;
  name: string;
  nameEn: string;
  summary: string;
  detail: string;
  training: string[];
  text: string;
  bg: string;
  border: string;
  chip: string;
}[] = [
  {
    id: "running",
    name: "ランニング",
    nameEn: "RUNNING",
    summary: "射撃と交互に行う「レーザーラン」として最後を締めくくる。",
    detail:
      "射撃とランニングを交互に繰り返す「レーザーラン」として行われ、近代五種の最終種目です。ここまでの得点差がスタート時間の差になるため、順位がそのまま目に見える形で競われます。",
    training: ["走り方の基礎", "インターバル走", "射撃と組み合わせた実戦形式"],
    text: "text-navy-800",
    bg: "bg-navy-50",
    border: "border-navy-200",
    chip: "bg-navy-800",
  },
  {
    id: "fencing",
    name: "フェンシング",
    nameEn: "FENCING",
    summary: "一瞬の判断が勝敗を分ける、思考のスポーツ。",
    detail:
      "近代五種のフェンシングはエペを使い、出場者全員と1分間ずつ戦う総当たり戦です。先に1本突いた方が勝ちという短い勝負のなかで、相手の癖を読み、間合いを測る力が問われます。",
    training: [
      "基本姿勢とフットワーク",
      "距離感をつくる練習",
      "1分間の総当たり形式の実戦",
    ],
    text: "text-gold-600",
    bg: "bg-gold-50",
    border: "border-gold-200",
    chip: "bg-gold-500",
  },
  {
    id: "swimming",
    name: "水泳",
    nameEn: "SWIMMING",
    summary: "全身持久力と正確なフォームを養う基礎種目。",
    // 泳力があるほうが望ましいが、条件として書かず「経験が活きる」という形で伝える
    detail:
      "200メートル自由形でタイムを競います。5種目のなかで最も基礎体力がそのまま結果に出る種目です。これまで泳いできた方は、その積み重ねをそのまま強みにできます。",
    training: ["フォーム改善のドリル", "距離を踏む持久系メニュー", "タイム測定"],
    text: "text-swim-500",
    bg: "bg-swim-50",
    border: "border-swim-500/20",
    chip: "bg-swim-500",
  },
  {
    id: "shooting",
    name: "射撃",
    nameEn: "SHOOTING",
    summary: "呼吸を整え、心拍を制御する集中力の種目。",
    detail:
      "レーザーピストルを使い、決められた的を狙います。走った直後の高い心拍のなかで正確に撃つ必要があるため、身体をどう落ち着かせるかが鍵になります。",
    training: ["据銃姿勢と呼吸の合わせ方", "静止状態での的当て", "走行後の実戦形式"],
    text: "text-shoot-500",
    bg: "bg-shoot-50",
    border: "border-shoot-500/20",
    chip: "bg-shoot-500",
  },
  {
    id: "obstacle",
    name: "障害物レース",
    nameEn: "OBSTACLE",
    summary: "うんてい、壁、ロープ。全身を使って駆け抜ける新種目。",
    detail:
      "2028年のロサンゼルス五輪から、馬術に代わって加わった種目です。うんていや壁のぼりなど8つの障害が並ぶコースを、次々に越えて駆け抜けます。腕・体幹・脚をまんべんなく使うため、身体づくりの土台になります。",
    training: ["うんてい・ぶら下がりの基礎", "体幹と握力のトレーニング", "コースを通しで走る実戦形式"],
    text: "text-obstacle-500",
    bg: "bg-obstacle-50",
    border: "border-obstacle-500/20",
    chip: "bg-obstacle-500",
  },
];

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  notice: "お知らせ",
  report: "活動報告",
  media: "メディア",
  recruit: "募集",
};

export const EVENT_CATEGORY_LABEL: Record<EventCategory, string> = {
  competition: "大会",
  trial: "体験会",
  camp: "合宿",
  openday: "見学会",
};

export const DAY_LABEL = ["日", "月", "火", "水", "木", "金", "土"] as const;

// お問い合わせフォームの種別プルダウン
export const INQUIRY_CATEGORIES = [
  "体験・見学のお申し込み",
  "練習形態のご相談（個別／グループ）",
  "入会について",
  "料金について",
  "取材・メディア",
  "その他",
] as const;
