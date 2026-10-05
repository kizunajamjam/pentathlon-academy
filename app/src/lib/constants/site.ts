import type { DisciplineId, EventCategory, NewsCategory } from "@/types";

// ⚠️ 仮テキスト: 正式な文言・数値が決まり次第このファイルを差し替える。
// 表示側のコンポーネントには文言を直書きせず、必ずここを参照させること。
//
// tel / address が null なのは未確認だからではなく「出さない」という判断。
// 住所は持たない運用で、電話も現状は公開していない（問い合わせはフォーム・
// メール・Instagram の DM で受ける）。表示側は null を見て項目ごと省くので、
// 載せることになったら文字列を入れるだけでよい。
export const SITE: {
  name: string;
  nameEn: string;
  tagline: string;
  description: string;
  email: string;
  tel: string | null;
  address: string | null;
  instagram: string;
  instagramHandle: string;
} = {
  name: "ペンタスロンアカデミー",
  nameEn: "PENTATHLON ACADEMY",
  tagline: "近代五種を通じて、人生を切り拓く総合力を育む",
  description:
    "フェンシング・オブスタクル・水泳・射撃・ランニング。性質のまったく違う5種目に、一人ひとりのペースで取り組むアカデミーです。",
  email: "pentathlonacademy.jp@gmail.com",
  tel: null,
  address: null,
  instagram: "https://www.instagram.com/pentathlonacademy.jp/",
  instagramHandle: "@pentathlonacademy.jp",
};

/*
 * 指導者。
 *
 * title は肩書き（カードのバッジに出す）。bio は経歴・実績を短い行に分けたもの。
 * 資格の保有者はオーナーから個人単位で届いたため、当該コーチの bio にそのまま
 * 含めている（以前はアカデミー全体の資格として別出しにしていたが廃止）。
 *
 * 顔写真は「なし」と明言されているため、このサイトでは指導者カードに
 * 写真枠自体を置かない（準備中ではなく、載せない方針）。
 */
export const COACHES: { name: string; title: string; bio: string[] }[] = [
  {
    name: "竹上譲一",
    title: "S&Cコーチ",
    bio: [
      "京都大学大学院理学研究科修士課程修了",
      "元 京都大学バスケットボール部 コーチ",
      "2026 HYROX OSAKA SINGLE OPEN 1:20:26",
      "2027 HYROX OSAKA SINGLE PRO",
      "OCR100m日本選手権出場",
    ],
  },
  {
    name: "小路瑛",
    title: "近代五種コーチ",
    bio: [
      "大阪体育大学体育学部スポーツ教育学科卒業",
      "近代五種日本選手権出場",
      "近代三種日本選手権優勝",
      "オリンピック有望選手育成指導者としてJOCより表彰（2013年）",
      "1500m 3分56秒34",
      "JSPO公認陸上競技コーチ1",
      "JSPO公認水泳上級教師",
      "JSPO公認競泳コーチ3",
      "JSPO公認フェンシングコーチ3",
      "日本オリンピックアカデミー会員",
    ],
  },
  {
    name: "宮下裕策",
    title: "メディカルアドバイザー",
    bio: [
      "京都大学医学部医学科卒業",
      "京都大学医学部附属病院勤務",
      "脳神経外科専攻（令和9年度付）",
      "800m 1分57秒08",
      "西日本医科学生総合体育大会 800m優勝",
      "近江八幡駅伝競走大会優勝（区間賞）",
    ],
  },
  {
    name: "山本隆世",
    title: "オブスタクル・テクニカルコーチ",
    bio: [
      "京都大学工学部建築学科3回生",
      "京大SASUKEサークル代表（第6代）",
      "スパルタンレース完走",
    ],
  },
  {
    name: "福島聡太",
    title: "オブスタクル・スプリントコーチ",
    bio: ["筑波大学医学群医学類5回生", "東日本医科学生総合体育大会 100m優勝", "100m 10秒50"],
  },
];

/*
 * 連携先。
 *
 * ⚠️ url が null のあいだはリンクにせず名前だけ出す。
 * オーナーからは「ホームページアドレスとともに」と依頼を受けているが、
 * アドレス自体は未受領。届いたら url を入れるとリンクになる。
 */
export const PARTNERS: { name: string; summary: string; url: string | null }[] = [
  {
    name: "ITAMI MED-FIT",
    summary: "コンディショニング・身体づくりの面で連携しています。",
    url: null,
  },
  {
    name: "無畏フェンシングクラブ",
    summary: "フェンシングの練習環境と指導の面で連携しています。",
    url: null,
  },
];

/*
 * 強化選手規定。
 *
 * これまで何かの競技に取り組んできた方に向けて、種目ごとにアカデミーが
 * 提示している規定。あくまで目安であって入会条件ではない。
 * 競技紹介ページの各種目から「〇〇強化選手規定を見る」で
 * アカデミーについてページの #standards-<種目id> に飛ぶ。
 *
 * 形は2種類。
 *   times   : 記録で判定する種目（水泳・ランニング）。男女別の表。
 *   ranking : ランキング・大会成績で判定する種目（フェンシング・オブスタクル・射撃）。
 * どちらも S / A / B の3段階。
 *
 * 水泳の 200m / 400m 個人メドレーは、水泳選手の地力を測るための種目。
 * 近代五種の水泳そのもの（100m自由形）とは別物なので、ここに 200m が
 * あっても競技の説明と矛盾しない。このまま残すことをオーナーに確認済み。
 */
export const STANDARD_LEVELS = [
  { label: "S", sub: "トップレベル" },
  { label: "A", sub: "ハイレベル" },
  { label: "B", sub: "チャレンジレベル" },
] as const;

export type Standard =
  | {
      kind: "times";
      // 表の上に出す説明（任意）
      lead?: string;
      groups: {
        gender: "男子" | "女子";
        events: { name: string; times: [string, string, string] }[];
      }[];
      // 表の下に出す注記（任意）
      notes: string[];
      plus: string[];
    }
  | {
      kind: "ranking";
      // 対象（任意）。例: 中学生以上・エペ・個人
      target?: string;
      lead: string;
      // 順位の列の見出し
      column: string;
      ranks: [string, string, string];
      notes: string[];
    };

export const STANDARDS: Record<DisciplineId, Standard> = {
  fencing: {
    kind: "ranking",
    target: "中学生以上・エペ・個人",
    lead: "判定日時点で日本フェンシング協会が公表している最新の全国ランキングを使用します。",
    column: "全国ランキング",
    ranks: ["1〜10位", "11〜30位", "31〜50位"],
    notes: [],
  },
  obstacle: {
    kind: "ranking",
    lead: "ユース・ジュニア・シニアの各カテゴリーについて、日本選手権の成績を基準とします。",
    column: "日本選手権順位",
    ranks: ["1〜3位", "4〜8位", "9〜16位"],
    notes: [],
  },
  swimming: {
    kind: "times",
    groups: [
      {
        gender: "男子",
        events: [
          { name: "50m 自由形", times: ["24.80", "25.50", "26.30"] },
          { name: "100m 自由形", times: ["53.50", "55.00", "56.50"] },
          { name: "200m 個人メドレー", times: ["2:10.00", "2:18.00", "2:25.00"] },
          { name: "400m 個人メドレー", times: ["4:45.00", "4:58.00", "5:15.00"] },
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
      },
    ],
    notes: [],
    plus: [],
  },
  shooting: {
    kind: "ranking",
    lead: "判定日時点で日本ライフル射撃協会が公表している最新の国内ビームピストル（BP）ランキングを使用します。",
    column: "国内ランキング",
    ranks: ["1〜10位", "11〜30位", "31〜50位"],
    notes: [],
  },
  running: {
    kind: "times",
    lead: "800m・1500m・3000mのいずれか1種目で基準記録を突破した場合、そのランクを認定します。",
    groups: [
      {
        gender: "男子",
        events: [
          { name: "800m", times: ["1:52.00", "1:56.00", "2:00.00"] },
          { name: "1500m", times: ["3:50.00", "3:55.00", "4:02.00"] },
          { name: "3000m", times: ["8:15.00", "8:30.00", "8:45.00"] },
        ],
      },
      {
        gender: "女子",
        events: [
          { name: "800m", times: ["2:08.00", "2:12.00", "2:16.00"] },
          { name: "1500m", times: ["4:22.00", "4:28.00", "4:35.00"] },
          { name: "3000m", times: ["9:10.00", "9:25.00", "9:45.00"] },
        ],
      },
    ],
    notes: [
      "年齢・世代による区分は設けません。",
      "日本陸上競技連盟公認記録を使用します。",
    ],
    plus: [],
  },
};

export const NAV_ITEMS = [
  { href: "/", label: "トップ", labelEn: "HOME" },
  { href: "/about", label: "アカデミーについて", labelEn: "ABOUT" },
  { href: "/news", label: "お知らせ", labelEn: "NEWS" },
  { href: "/disciplines", label: "トレーニング", labelEn: "TRAINING" },
  { href: "/schedule", label: "練習スケジュール", labelEn: "SCHEDULE" },
  { href: "/athletes", label: "強化選手", labelEn: "ATHLETES" },
  { href: "/events", label: "大会・イベント", labelEn: "EVENTS" },
  { href: "/ancient", label: "古代五種", labelEn: "ANCIENT" },
  { href: "/contact", label: "お問い合わせ", labelEn: "CONTACT" },
] as const;

// 競技ごとの表示情報。色はロゴの五角形の各面から取っている。
//
// 並び順はオーナー指定（フェンシング / オブスタクル / 水泳 / 射撃 / ランニング）。
// この配列の順序が、トップページの種目チップ列、競技紹介ページの 01〜05、
// 管理画面の種目プルダウンにそのまま反映される。
// （ホームのロゴはホバーで面が浮かび上がる方式で、当たり判定は
//   logo-geometry.ts の座標を使う。この配列の順序とは連動しない。）
//
// tailwind のクラス名は文字列結合で生成すると purge されるため、完全な形で持つ。
export const DISCIPLINES: {
  id: DisciplineId;
  name: string;
  nameEn: string;
  summary: string;
  detail: string;
  training: string[];
  // 練習内容の下に添える補足（任意）
  trainingNote?: string;
  // public/photos/ 配下の練習写真（任意）。無い種目は PhotoSlot が出る。
  photo?: string;
  text: string;
  bg: string;
  border: string;
  chip: string;
}[] = [
  {
    // 新ルールのボーナスラウンドには触れず、総当たり戦だけを説明する方針。
    // 追記するか確認したうえで、現状のままとすることをオーナーに確認済み。
    id: "fencing",
    name: "フェンシング",
    nameEn: "FENCING",
    summary: "一瞬の判断が勝敗を分ける、思考の種目。",
    detail:
      "近代五種のフェンシングはエペで実施される。エペは全身（頭から足先まで）が有効面の種目。近代五種では、出場者全員と1分間ずつ戦う総当たり戦です。先に1本突いた方が勝ちという短い勝負のなかで、相手の癖を読み、間合いを測る力が問われます。",
    training: [
      "基本姿勢とフットワーク",
      "距離感をつくる練習",
      "1分間の総当たり形式の実戦",
    ],
    photo: "/photos/fencing.jpg",
    // 文字色だけ一段濃くしている。gold-600 は白地で 3.66:1 しかなく、
    // 競技の説明文やスケジュールの種目名が読みにくかった（要 4.5:1）。
    // 丸や面に使う gold-500 は図形なので、そのままでよい。
    text: "text-gold-700",
    bg: "bg-gold-50",
    border: "border-gold-200",
    chip: "bg-gold-500",
  },
  {
    id: "obstacle",
    name: "オブスタクル",
    nameEn: "OBSTACLE",
    summary: "全身を使って駆け抜ける新種目。",
    detail:
      "モンキーバーやフィニッシュウォールなど8つの障害が並ぶコースを、次々に越えて駆け抜ける種目です。腕・体幹・脚をまんべんなく使うため、身体づくりの土台になります。",
    training: ["スイング・ぶら下がりの基礎", "体幹と握力のトレーニング", "コースを通しで走る実戦形式"],
    photo: "/photos/obstacle.jpg",
    text: "text-obstacle-500",
    bg: "bg-obstacle-50",
    border: "border-obstacle-500/20",
    chip: "bg-obstacle-500",
  },
  {
    id: "swimming",
    name: "水泳",
    nameEn: "SWIMMING",
    summary: "100mで、泳力のすべてを出し切る。",
    // 泳力があるほうが望ましいが、条件として書かず「経験が活きる」という形で伝える
    detail:
      "スタートから浮き上がり、ストローク、ターン、タッチ、一つひとつの技術がタイムを左右する。",
    training: ["フォーム改善のドリル", "CSS理論に基づく強度設定", "タイム測定"],
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
    training: ["据銃姿勢と呼吸の合わせ方", "静止状態での練習", "走行後の実践練習"],
    text: "text-shoot-500",
    bg: "bg-shoot-50",
    border: "border-shoot-500/20",
    chip: "bg-shoot-500",
  },
  {
    id: "running",
    name: "ランニング",
    nameEn: "RUNNING",
    summary: "射撃と交互に行う「レーザーラン」として最後を締めくくる。",
    detail:
      "射撃とランニングを交互に繰り返す「レーザーラン」として行われ、近代五種の最終種目です。ここまでの得点差がスタート時間の差になるため、順位がそのまま目に見える形で競われます。",
    training: ["走り方の基礎", "ダニエルズ理論に基づく強度設定", "射撃と組み合わせた実戦形式"],
    text: "text-navy-800",
    bg: "bg-navy-50",
    border: "border-navy-200",
    chip: "bg-navy-800",
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

/*
 * 強化選手。
 *
 * designation は強化選手規定のどの種目・ランクで指定されたか。
 * 記録は大会名や日付が未確認なので、種目と記録だけを載せている。
 */
export const ATHLETES: {
  name: string;
  discipline: DisciplineId;
  designation: string;
  records: { event: string; time: string }[];
}[] = [
  {
    name: "蒲生貴之",
    discipline: "swimming",
    designation: "水泳S指定",
    records: [{ event: "50m 自由形（短水路）", time: "24秒64" }],
  },
];
