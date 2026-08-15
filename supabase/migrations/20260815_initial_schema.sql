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
  start_time time not null,
  end_time time not null,
  class_name text not null,
  discipline text
    -- 馬術は2028年ロス五輪から廃止され、障害物レース(obstacle)に置き換わった
    check (discipline in ('fencing', 'swimming', 'obstacle', 'shooting', 'running')),
  location text,
  note text,
  -- 同じ曜日に複数枠があるときの並び順
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
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
