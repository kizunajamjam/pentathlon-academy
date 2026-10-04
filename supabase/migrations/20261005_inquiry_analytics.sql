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
