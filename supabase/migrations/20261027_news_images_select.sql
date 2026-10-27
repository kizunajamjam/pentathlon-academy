-- お知らせ画像の置き場で、スタッフがファイルを「見つけられる」ようにする。
--
-- 画像を外す・差し替える・記事ごと消すときに、置き場からもファイルを消すようにした（lib/db/news-image.ts）。
-- Storage の削除は、消す対象を探す select と delete の両方の許可が要る。select の許可が無いと、
-- エラーにもならずに何も消えない。
-- 公開の置き場なので、画像の表示（公開 URL）はこの設定に関係なく誰でもできる。
create policy news_images_select on storage.objects
  for select to authenticated
  using (bucket_id = 'news-images' and public.is_staff());
