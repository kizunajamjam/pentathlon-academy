-- スタッフのロール（管理者／編集者）
--
-- 管理者 (admin) : すべての操作に加えて、スタッフの招待・ロール変更・削除ができる
-- 編集者 (editor): お知らせ・スケジュール・大会・指導者・選手・お問い合わせの操作だけ
--
-- 内容の読み書き（is_staff）は今までどおり両方に許す。スタッフの管理だけを管理者に限る。
alter table public.staff
  add column role text not null default 'editor'
    check (role in ('admin', 'editor'));

-- ロールを入れる前は全員がすべての操作をできたので、今いるスタッフは管理者にしておく
update public.staff set role = 'admin';

-- 管理者か（二段階認証まで済ませたセッションに限る。is_staff と同じ考え方）
create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
     and exists (select 1 from public.staff where user_id = auth.uid() and role = 'admin');
$$;

-- 管理者は全員の行を見て、名前・ロールを変え、削除できる。
-- 追加は招待と同時にサーバー（service_role）で行うので、authenticated には許さない。
create policy staff_select_admin on public.staff
  for select
  using (public.is_admin());

create policy staff_update_admin on public.staff
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy staff_delete_admin on public.staff
  for delete
  using (public.is_admin());

grant update (name, role), delete on table public.staff to authenticated;
grant insert, update, delete on table public.staff to service_role;

-- 管理者が1人もいなくなる変更は断る（誰もスタッフを管理できなくなるため）。
-- ロールの変更・行の削除のほか、アカウントの削除（auth.users から連鎖して消える）でも効く。
-- 管理者の行が変わったときだけ数える（管理者のいない間も、ほかの行の削除は止めない）。
-- security definer にして、操作した人の RLS に関係なく全員の行で数える。
create function public.staff_keep_one_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 2人の管理者が同時にお互いを外すと、どちらの確認も相手が残っているように見えて
  -- 0人になりうる。確認を1つずつ順番に行わせて防ぐ（ロックは取引の終わりに外れる）
  perform pg_advisory_xact_lock(hashtext('public.staff_keep_one_admin'));
  if not exists (select 1 from public.staff where role = 'admin') then
    raise exception '管理者を0人にはできません' using errcode = 'P0001';
  end if;
  return null;
end;
$$;

create trigger staff_keep_one_admin
  after update of role or delete on public.staff
  for each row
  when (old.role = 'admin')
  execute function public.staff_keep_one_admin();
