// 五種競技の識別子。ロゴの五角形の各面と 1:1 で対応する。
// 2028年ロサンゼルス五輪から馬術は廃止され、オブスタクル(obstacle)に置き換わった。
export type DisciplineId = "fencing" | "obstacle" | "swimming" | "shooting" | "running";

export type NewsCategory = "notice" | "report" | "media" | "recruit";

export type News = {
  id: string;
  title: string;
  category: NewsCategory;
  body: string;
  publishedAt: string;
  isPublished: boolean;
  // お知らせの画像（Supabase Storage の公開 URL）。無ければ null。
  imageUrl: string | null;
};

export type EventCategory = "competition" | "trial" | "camp" | "openday";

export type AcademyEvent = {
  id: string;
  title: string;
  category: EventCategory;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  description: string | null;
  // 外部の大会要項・申込ページへのリンク（協会サイトなど）。無ければ null。
  url: string | null;
  isPublished: boolean;
};

// 曜日。0=日曜 ... 6=土曜(JavaScript の Date.getDay() に合わせる)
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// 練習スケジュールは「毎週この曜日のこの時間」という繰り返し枠として持つ。
// 単発の予定は events 側で扱う。
export type ScheduleSlot = {
  id: string;
  dayOfWeek: DayOfWeek;
  // 練習は基本的に選手と相談のうえで場所・時間を決めるため、
  // 固定の時刻を持たない枠がある（null は「時間は個別に相談」を意味する）。
  startTime: string | null; // "17:30"
  endTime: string | null; // "19:00"
  // 例: 初級クラス、選手クラス。種目チップだけでは表せない活動名
  // （コオーディネーション、レーザーラン 等）を出すためにも使う。
  className: string | null;
  discipline: DisciplineId | null;
  location: string | null;
  note: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  category: string;
  message: string;
  isHandled: boolean;
  createdAt: string;
  // 流入元（utm_source かリファラーのホスト名）。直接訪問は null
  source: string | null;
  // 最初に開いたページ
  landingPath: string | null;
  // 対応済みにした日時
  handledAt: string | null;
};

export type Coach = {
  id: string;
  name: string;
  // 肩書き（カードのバッジに出す）
  title: string;
  // 経歴・実績を1行ずつ
  bio: string[];
  sortOrder: number;
  isPublished: boolean;
};

export type AthleteRecord = { event: string; time: string };

export type Athlete = {
  id: string;
  name: string;
  discipline: DisciplineId;
  // 強化選手規定のどの種目・ランクで指定されたか（例: 水泳S指定）
  designation: string;
  records: AthleteRecord[];
  sortOrder: number;
  isPublished: boolean;
};
