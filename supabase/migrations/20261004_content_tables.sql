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

