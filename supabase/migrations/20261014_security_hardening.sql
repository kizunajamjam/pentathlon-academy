-- セキュリティの強化
--
-- 1. 管理者の判定（is_staff）に二段階認証を必須にする。
--    パスワードだけでログインしたセッション（aal1）では、お知らせ・大会・問い合わせなどを
--    読み書きできない。認証アプリのコードまで確認したセッション（aal2）だけが管理者になる。
--    アプリの画面を通らず、API を直接呼ばれても同じく弾かれる。
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
     and exists (select 1 from public.staff where user_id = auth.uid());
$$;

-- 2. お知らせ画像の置き場に、画像以外・大きすぎるファイルを置けないようにする。
--    万一管理者のアカウントが使われても、偽のページ（HTML）などを公開の置き場に置かせない。
update storage.buckets
set file_size_limit = 4 * 1024 * 1024,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'news-images';
