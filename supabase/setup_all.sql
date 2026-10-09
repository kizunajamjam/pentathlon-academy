-- ============================================================================
-- 本番 Supabase の初期設定（supabase/migrations/ の全ファイルを日付順につないだもの）
-- SQL Editor に全文を貼り付けて1回だけ実行する。2回目以降は実行しないこと（データが重複する）。
-- 作り直し: cat supabase/migrations/*.sql を日付順に連結する（このファイルは直接編集しない）
-- ============================================================================


-- ── 20260815_initial_schema.sql ──────────────────────────────────────────
-- ペンタスロンアカデミー HP の初期スキーマ
--
-- 公開サイトなので「誰でも読めるが、書けるのはスタッフだけ」が基本方針。
-- ただし お問い合わせ だけは逆で、匿名が insert でき、読めるのはスタッフだけ。
--
-- スタッフの判定は staff テーブルの allowlist で行う。
-- 「authenticated なら全員スタッフ」にしないのは、Supabase のサインアップを
-- 閉じ忘れた場合に誰でも編集できてしまうため。アカウント自体は Supabase の
-- ダッシュボードから発行し、その user_id をこの staff に登録して運用する。

-- ── スタッフ ─────────────────────────────────────────────────────────
create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- RLS ポリシーから参照する。security definer にしないと staff 自身の
-- RLS が再帰的に評価されて無限ループになる。
create function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

alter table public.staff enable row level security;

-- 自分の行だけ見えれば十分（管理画面で氏名を表示する用途）。
create policy staff_select on public.staff
  for select
  using (user_id = auth.uid());

-- ── お知らせ ─────────────────────────────────────────────────────────
create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'notice'
    check (category in ('notice', 'report', 'media', 'recruit')),
  body text not null default '',
  -- 公開日時。未来の日時を入れておくと予約投稿になる。
  published_at timestamptz not null default now(),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_published_idx on public.news (is_published, published_at desc);

alter table public.news enable row level security;

-- 公開済みかつ公開日時が到来したものは誰でも読める。
create policy news_select_public on public.news
  for select
  using (is_published and published_at <= now());

-- スタッフは下書きも含めて全件読める（上のポリシーと OR で評価される）。
create policy news_select_staff on public.news
  for select
  using (public.is_staff());

create policy news_insert on public.news
  for insert
  with check (public.is_staff());

create policy news_update on public.news
  for update
  using (public.is_staff());

create policy news_delete on public.news
  for delete
  using (public.is_staff());

-- ── 練習スケジュール（毎週の繰り返し枠） ───────────────────────────
create table public.schedule_slots (
  id uuid primary key default gen_random_uuid(),
  -- 0=日曜 ... 6=土曜（JavaScript の Date.getDay() に合わせている）
  day_of_week smallint not null check (day_of_week between 0 and 6),
  -- 練習は基本的に選手と相談のうえで時間を決めるため、固定時刻を持たない枠がある。
  -- start_time / end_time は両方 null（個別に相談）か、両方入っているかのどちらか。
  start_time time,
  end_time time,
  -- クラス名も同様に任意。種目に当てはまらない活動名（コオーディネーション 等）にも使う。
  class_name text,
  discipline text
    -- 馬術は2028年ロス五輪から廃止され、オブスタクル(obstacle)に置き換わった
    check (discipline in ('fencing', 'obstacle', 'swimming', 'shooting', 'running')),
  location text,
  note text,
  -- 同じ曜日に複数枠があるときの並び順
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((start_time is null) = (end_time is null)),
  check (start_time is null or end_time > start_time)
);

create index schedule_slots_day_idx on public.schedule_slots (day_of_week, sort_order);

alter table public.schedule_slots enable row level security;

create policy schedule_slots_select_public on public.schedule_slots
  for select
  using (is_active);

create policy schedule_slots_select_staff on public.schedule_slots
  for select
  using (public.is_staff());

create policy schedule_slots_insert on public.schedule_slots
  for insert
  with check (public.is_staff());

create policy schedule_slots_update on public.schedule_slots
  for update
  using (public.is_staff());

create policy schedule_slots_delete on public.schedule_slots
  for delete
  using (public.is_staff());

-- ── 大会・イベント（日付が決まっている単発の予定） ─────────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'competition'
    check (category in ('competition', 'trial', 'camp', 'openday')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  description text,
  -- 大会要項・申込ページ（協会サイトなど外部）へのリンク
  url text check (url is null or url ~ '^https?://'),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create index events_starts_at_idx on public.events (is_published, starts_at);

alter table public.events enable row level security;

create policy events_select_public on public.events
  for select
  using (is_published);

create policy events_select_staff on public.events
  for select
  using (public.is_staff());

create policy events_insert on public.events
  for insert
  with check (public.is_staff());

create policy events_update on public.events
  for update
  using (public.is_staff());

create policy events_delete on public.events
  for delete
  using (public.is_staff());

-- ── お問い合わせ ─────────────────────────────────────────────────────
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (char_length(phone) <= 30),
  category text not null,
  message text not null check (char_length(message) between 1 and 2000),
  is_handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index inquiries_created_at_idx on public.inquiries (created_at desc);

alter table public.inquiries enable row level security;

-- 匿名から送信できる。select は許可しないので、
-- アプリ側の insert では .select() を付けないこと
-- （付けると SELECT ポリシーも評価されて 42501 になる）。
create policy inquiries_insert_anon on public.inquiries
  for insert
  to anon, authenticated
  with check (true);

create policy inquiries_select_staff on public.inquiries
  for select
  using (public.is_staff());

create policy inquiries_update_staff on public.inquiries
  for update
  using (public.is_staff());

create policy inquiries_delete_staff on public.inquiries
  for delete
  using (public.is_staff());

-- ── updated_at の自動更新 ────────────────────────────────────────────
create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger news_touch_updated_at
  before update on public.news
  for each row execute function public.touch_updated_at();

create trigger schedule_slots_touch_updated_at
  before update on public.schedule_slots
  for each row execute function public.touch_updated_at();

create trigger events_touch_updated_at
  before update on public.events
  for each row execute function public.touch_updated_at();

-- ── GRANT ────────────────────────────────────────────────────────────
-- 実際に通す/弾くの判断は RLS 側で行う。ここは入口の権限のみ。
grant select on table public.news, public.schedule_slots, public.events to anon;
grant insert on table public.inquiries to anon;

grant select, insert, update, delete on table
  public.news,
  public.schedule_slots,
  public.events,
  public.inquiries
to authenticated, service_role;

grant select on table public.staff to authenticated, service_role;


-- ── 20261004_content_tables.sql ──────────────────────────────────────────
-- 指導者・強化選手のテーブル化と、お知らせの画像
--
-- これまで lib/constants/site.ts に直書きしていた指導者と強化選手を、
-- 管理画面から更新できるようにする。既存の内容は末尾で初期データとして移す。

-- ── 指導者 ───────────────────────────────────────────────────────────
create table public.coaches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- 肩書き（カードのバッジに出す）
  title text not null,
  -- 経歴・実績を1行ずつ
  bio text[] not null default '{}',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index coaches_sort_idx on public.coaches (is_published, sort_order);

-- ── 強化選手 ─────────────────────────────────────────────────────────
create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  discipline text not null
    check (discipline in ('fencing', 'obstacle', 'swimming', 'shooting', 'running')),
  -- 強化選手規定のどの種目・ランクで指定されたか（例: 水泳S指定）
  designation text not null,
  -- [{"event": "50m 自由形（短水路）", "time": "24秒64"}]
  records jsonb not null default '[]'
    check (jsonb_typeof(records) = 'array'),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index athletes_sort_idx on public.athletes (is_published, sort_order);

alter table public.coaches enable row level security;
alter table public.athletes enable row level security;

create policy coaches_select_public on public.coaches for select using (is_published);
create policy coaches_select_staff on public.coaches for select using (public.is_staff());
create policy coaches_insert on public.coaches for insert with check (public.is_staff());
create policy coaches_update on public.coaches for update using (public.is_staff());
create policy coaches_delete on public.coaches for delete using (public.is_staff());

create policy athletes_select_public on public.athletes for select using (is_published);
create policy athletes_select_staff on public.athletes for select using (public.is_staff());
create policy athletes_insert on public.athletes for insert with check (public.is_staff());
create policy athletes_update on public.athletes for update using (public.is_staff());
create policy athletes_delete on public.athletes for delete using (public.is_staff());

create trigger coaches_touch_updated_at
  before update on public.coaches
  for each row execute function public.touch_updated_at();

create trigger athletes_touch_updated_at
  before update on public.athletes
  for each row execute function public.touch_updated_at();

grant select on table public.coaches, public.athletes to anon;
grant select, insert, update, delete on table public.coaches, public.athletes
  to authenticated, service_role;

-- ── お知らせの画像 ───────────────────────────────────────────────────
alter table public.news add column image_url text
  check (image_url is null or image_url ~ '^https?://');

-- 画像の置き場。公開バケットなので URL を知っていれば誰でも見られる（お知らせ用途なので問題ない）。
-- 書き込みはスタッフのみ。
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;

create policy news_images_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'news-images' and public.is_staff());

create policy news_images_update on storage.objects
  for update to authenticated
  using (bucket_id = 'news-images' and public.is_staff());

create policy news_images_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'news-images' and public.is_staff());

-- 現在コードに直書きされている内容を、そのまま初期データとして移す。
insert into public.coaches (name, title, bio, sort_order, is_published) values
  ('竹上譲一', 'S&Cコーチ', array['京都大学大学院理学研究科修士課程修了', '元 京都大学バスケットボール部 コーチ', '2026 HYROX OSAKA SINGLE OPEN 1:20:26', '2027 HYROX OSAKA SINGLE PRO', 'OCR100m日本選手権出場'], 0, true),
  ('小路瑛', '近代五種コーチ', array['大阪体育大学体育学部スポーツ教育学科卒業', '近代五種日本選手権出場', '近代三種日本選手権優勝', 'オリンピック有望選手育成指導者としてJOCより表彰（2013年）', '1500m 3分56秒34', 'JSPO公認陸上競技コーチ1', 'JSPO公認水泳上級教師', 'JSPO公認競泳コーチ3', 'JSPO公認フェンシングコーチ3', '日本オリンピックアカデミー会員'], 10, true),
  ('宮下裕策', 'メディカルアドバイザー', array['京都大学医学部医学科卒業', '京都大学医学部附属病院勤務', '脳神経外科専攻（令和9年度付）', '800m 1分57秒08', '西日本医科学生総合体育大会 800m優勝', '近江八幡駅伝競走大会優勝（区間賞）'], 20, true),
  ('山本隆世', 'オブスタクル・テクニカルコーチ', array['京都大学工学部建築学科3回生', '京大SASUKEサークル代表（第6代）', 'スパルタンレース完走'], 30, true),
  ('福島聡太', 'オブスタクル・スプリントコーチ', array['筑波大学医学群医学類5回生', '東日本医科学生総合体育大会 100m優勝', '100m 10秒50'], 40, true);

insert into public.athletes (name, discipline, designation, records, sort_order, is_published) values
  ('蒲生貴之', 'swimming', '水泳S指定', '[{"event":"50m 自由形（短水路）","time":"24秒64"}]'::jsonb, 0, true);



-- ── 20261005_inquiry_analytics.sql ──────────────────────────────────────────
-- お問い合わせの分析用の列と、匿名 insert の制限
--
-- 「どこから来た問い合わせか」「どれくらいで対応できたか」を後から集計できるようにする。

alter table public.inquiries
  -- 流入元。utm_source、なければリファラーのホスト名、どちらも無ければ null（直接訪問）
  add column source text check (char_length(source) <= 100),
  -- 最初に開いたページ（例: /schedule）
  add column landing_path text check (char_length(landing_path) <= 200),
  -- 対応済みにした日時。受信からの対応時間を測るために使う
  add column handled_at timestamptz;

-- 対応済みへ切り替わった時刻を自動で記録する（戻したら消す）
create function public.set_inquiry_handled_at()
returns trigger
language plpgsql
as $$
begin
  if new.is_handled and not old.is_handled then
    new.handled_at = now();
  elsif not new.is_handled then
    new.handled_at = null;
  end if;
  return new;
end;
$$;

create trigger inquiries_set_handled_at
  before update on public.inquiries
  for each row execute function public.set_inquiry_handled_at();

-- 匿名 insert の条件を厳しくする。
-- アプリを経由せず anon キーで直接 insert されても、
-- 対応済みの行や極端に長い値を入れられないようにする。
drop policy inquiries_insert_anon on public.inquiries;

create policy inquiries_insert_anon on public.inquiries
  for insert
  to anon, authenticated
  with check (
    not is_handled
    and handled_at is null
    and char_length(category) <= 100
  );


-- ── 20261006_add_athlete_nishikawa.sql ──────────────────────────────────────────
-- 強化選手に西川陽治（オブスタクルA指定）を追加する。
insert into public.athletes (name, discipline, designation, records, sort_order, is_published) values
  ('西川陽治', 'obstacle', 'オブスタクルA指定', '[{"event":"第2回OCR100m日本選手権 ユース","time":"7位"}]'::jsonb, 10, true);


-- ── 20261008_seed_events_schedule.sql ──────────────────────────────────────────
-- 大会・イベントと練習スケジュールの初期データ（app/src/lib/db/seed.ts と同じ内容）。
-- 本番の Supabase に入れておかないと、公開ページの該当欄が空になる。
-- 以後の追加・変更は管理画面から行う。

insert into public.events (title, category, starts_at, ends_at, location, description, url, is_published) values
  ('2026 ジュニア世界選手権大会派遣選考会 兼 シニア記録会', 'competition', '2026-04-28T15:00:00.000Z', null, null, '日本近代五種協会が主催した、ジュニア世界選手権の派遣選考会とシニア記録会です。', 'https://pentathlon.jp/news/%e3%80%90%e3%82%a8%e3%83%b3%e3%83%88%e3%83%aa%e3%83%bc%e5%8f%97%e4%bb%98%e4%b8%ad%e3%80%912026-%e3%82%b8%e3%83%a5%e3%83%8b%e3%82%a2%e4%b8%96%e7%95%8c%e9%81%b8%e6%89%8b%e5%a4%a7%e4%bc%9a%e6%a8%a9/', true),
  ('ブルジャンプCUP2026 第2回 滋賀県東近江市ラウンド', 'competition', '2026-05-23T15:00:00.000Z', null, '滋賀県東近江市', '日本近代五種協会が主催した近代3種のシリーズ戦です。', 'https://pentathlon.jp/news/%e8%bf%91%e4%bb%a33%e7%a8%ae%e3%82%b7%e3%83%aa%e3%83%bc%e3%82%ba%e3%80%8c%e3%83%96%e3%83%ab%e3%82%b8%e3%83%a3%e3%83%b3%e3%83%97cup2026%e3%80%8d%e9%96%8b%e5%82%ac%e6%b1%ba%e5%ae%9a/', true),
  ('ブルジャンプCUP2026 第3回 東京都立川市ラウンド', 'competition', '2026-06-27T15:00:00.000Z', null, '東京都立川市', '日本近代五種協会が主催した近代3種のシリーズ戦です。', 'https://pentathlon.jp/news/%e8%bf%91%e4%bb%a33%e7%a8%ae%e3%82%b7%e3%83%aa%e3%83%bc%e3%82%ba%e3%80%8c%e3%83%96%e3%83%ab%e3%82%b8%e3%83%a3%e3%83%b3%e3%83%97cup2026%e3%80%8d%e9%96%8b%e5%82%ac%e6%b1%ba%e5%ae%9a/', true),
  ('2026 ランキング戦（第1戦）', 'competition', '2026-07-04T15:00:00.000Z', null, null, '日本近代五種協会が主催したランキング戦です。', 'https://pentathlon.jp/news/2026ranking1/', true),
  ('ブルジャンプCUP2026 第4回 福島県棚倉町ラウンド', 'competition', '2026-09-26T15:00:00.000Z', null, '福島県棚倉町', '日本近代五種協会が主催した近代3種のシリーズ戦です。', 'https://pentathlon.jp/news/%e8%bf%91%e4%bb%a33%e7%a8%ae%e3%82%b7%e3%83%aa%e3%83%bc%e3%82%ba%e3%80%8c%e3%83%96%e3%83%ab%e3%82%b8%e3%83%a3%e3%83%b3%e3%83%97cup2026%e3%80%8d%e9%96%8b%e5%82%ac%e6%b1%ba%e5%ae%9a/', true),
  ('2026 ランキング戦（第2戦）', 'competition', '2026-10-11T15:00:00.000Z', null, null, '日本近代五種協会が主催するランキング戦です。エントリー方法や実施要項は協会サイトの記事をご確認ください。', 'https://pentathlon.jp/news/2026ranking2/', true),
  ('第66回近代五種全日本選手権大会', 'competition', '2026-11-27T15:00:00.000Z', '2026-11-28T15:00:00.000Z', 'リソルの森メディカルトレーニングセンター（千葉県長生郡）', '日本近代五種協会が主催する近代五種の日本選手権です。エントリー方法や大会要項は協会サイトの記事をご確認ください。', 'https://pentathlon.jp/news/%E7%AC%AC%EF%BC%96%EF%BC%96%E5%9B%9E%E8%BF%91%E4%BB%A3%E4%BA%94%E7%A8%AE%E5%85%A8%E6%97%A5%E6%9C%AC%E9%81%B8%E6%89%8B%E6%A8%A9%E5%A4%A7%E4%BC%9A/', true),
  ('第13回近代3種日本選手権大会 兼 第20回JOCジュニアオリンピックカップ', 'competition', '2026-11-27T15:00:00.000Z', null, 'リソルの森メディカルトレーニングセンター（千葉県長生郡）', '日本近代五種協会が主催する近代3種の日本選手権です。エントリーの締切は2026年10月31日（土）23:59です。大会要項は協会サイトの記事をご確認ください。', 'https://pentathlon.jp/news/%E7%AC%AC%EF%BC%96%EF%BC%96%E5%9B%9E%E8%BF%91%E4%BB%A3%E4%BA%94%E7%A8%AE%E5%85%A8%E6%97%A5%E6%9C%AC%E9%81%B8%E6%89%8B%E6%A8%A9%E5%A4%A7%E4%BC%9A/', true);

insert into public.schedule_slots (day_of_week, start_time, end_time, class_name, discipline, location, note, sort_order, is_active) values
  (0, null, null, null, 'running', '森ノ宮キューズモールエアトラック', null, 1, true),
  (0, null, null, null, 'obstacle', '玉造公園', null, 2, true),
  (1, null, null, null, 'fencing', '無畏フェンシングクラブ', 'ファイティング', 1, true),
  (2, null, null, null, 'fencing', '無畏フェンシングクラブ', 'レッスン', 1, true),
  (3, null, null, 'コオーディネーション', null, '大阪城公園', null, 1, true),
  (4, null, null, null, 'running', '森ノ宮キューズモールエアトラック', null, 1, true),
  (5, null, null, null, 'fencing', '無畏フェンシングクラブ', 'レッスン', 1, true),
  (6, null, null, null, 'swimming', '尼崎スポーツの森', null, 1, true),
  (6, null, null, null, 'shooting', '門真市立総合体育館', null, 2, true);


-- ── 20261008_update_coach_bios.sql ──────────────────────────────────────────
-- 指導者の経歴を更新する（site.ts の COACHES と同じ内容）。
-- 竹上譲一: 「2027 HYROX OSAKA SINGLE PRO」を削除
update public.coaches
  set bio = array_remove(bio, '2027 HYROX OSAKA SINGLE PRO'), updated_at = now()
  where name = '竹上譲一';

-- 小路瑛: JOC表彰を一番下へ移動
update public.coaches
  set bio = array_append(
        array_remove(bio, 'オリンピック有望選手育成指導者としてJOCより表彰（2013年）'),
        'オリンピック有望選手育成指導者としてJOCより表彰（2013年）'),
      updated_at = now()
  where name = '小路瑛';


-- ── 20261009_kin3_notation.sql ──────────────────────────────────────────
-- 「近代三種」を正式表記の「近代3種」にそろえる（site.ts の COACHES と同じ内容）。
update public.coaches
  set bio = array_replace(bio, '近代三種日本選手権優勝', '近代3種日本選手権優勝'), updated_at = now()
  where '近代三種日本選手権優勝' = any (bio);
