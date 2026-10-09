-- 大会・イベントと練習スケジュールの初期データ（app/src/lib/db/seed.ts と同じ内容）。
-- 本番の Supabase に入れておかないと、公開ページの該当欄が空になる。
-- 以後の追加・変更は管理画面から行う。

insert into public.events (title, category, starts_at, ends_at, location, description, url, is_published) values
  ('2026 ジュニア世界選手権大会派遣選考会 兼 シニア記録会', 'competition', '2026-04-28T15:00:00.000Z', null, null, '日本近代五種協会が主催した、ジュニア世界選手権の派遣選考会とシニア記録会です。', 'https://pentathlon.jp/news/%e3%80%90%e3%82%a8%e3%83%b3%e3%83%88%e3%83%aa%e3%83%bc%e5%8f%97%e4%bb%98%e4%b8%ad%e3%80%912026-%e3%82%b8%e3%83%a5%e3%83%8b%e3%82%a2%e4%b8%96%e7%95%8c%e9%81%b8%e6%89%8b%e5%a4%a7%e4%bc%9a%e6%a8%a9/', true),
  ('ブルジャンプCUP2026 第2回 滋賀県東近江市ラウンド', 'competition', '2026-05-23T15:00:00.000Z', null, '滋賀県東近江市', '日本近代五種協会が主催した近代３種のシリーズ戦です。', 'https://pentathlon.jp/news/%e8%bf%91%e4%bb%a33%e7%a8%ae%e3%82%b7%e3%83%aa%e3%83%bc%e3%82%ba%e3%80%8c%e3%83%96%e3%83%ab%e3%82%b8%e3%83%a3%e3%83%b3%e3%83%97cup2026%e3%80%8d%e9%96%8b%e5%82%ac%e6%b1%ba%e5%ae%9a/', true),
  ('ブルジャンプCUP2026 第3回 東京都立川市ラウンド', 'competition', '2026-06-27T15:00:00.000Z', null, '東京都立川市', '日本近代五種協会が主催した近代３種のシリーズ戦です。', 'https://pentathlon.jp/news/%e8%bf%91%e4%bb%a33%e7%a8%ae%e3%82%b7%e3%83%aa%e3%83%bc%e3%82%ba%e3%80%8c%e3%83%96%e3%83%ab%e3%82%b8%e3%83%a3%e3%83%b3%e3%83%97cup2026%e3%80%8d%e9%96%8b%e5%82%ac%e6%b1%ba%e5%ae%9a/', true),
  ('2026 ランキング戦（第1戦）', 'competition', '2026-07-04T15:00:00.000Z', null, null, '日本近代五種協会が主催したランキング戦です。', 'https://pentathlon.jp/news/2026ranking1/', true),
  ('ブルジャンプCUP2026 第4回 福島県棚倉町ラウンド', 'competition', '2026-09-26T15:00:00.000Z', null, '福島県棚倉町', '日本近代五種協会が主催した近代３種のシリーズ戦です。', 'https://pentathlon.jp/news/%e8%bf%91%e4%bb%a33%e7%a8%ae%e3%82%b7%e3%83%aa%e3%83%bc%e3%82%ba%e3%80%8c%e3%83%96%e3%83%ab%e3%82%b8%e3%83%a3%e3%83%b3%e3%83%97cup2026%e3%80%8d%e9%96%8b%e5%82%ac%e6%b1%ba%e5%ae%9a/', true),
  ('2026 ランキング戦（第2戦）', 'competition', '2026-10-11T15:00:00.000Z', null, null, '日本近代五種協会が主催するランキング戦です。エントリー方法や実施要項は協会サイトの記事をご確認ください。', 'https://pentathlon.jp/news/2026ranking2/', true),
  ('第66回近代五種全日本選手権大会', 'competition', '2026-11-27T15:00:00.000Z', '2026-11-28T15:00:00.000Z', 'リソルの森メディカルトレーニングセンター（千葉県長生郡）', '日本近代五種協会が主催する近代五種の日本選手権です。エントリー方法や大会要項は協会サイトの記事をご確認ください。', 'https://pentathlon.jp/news/%E7%AC%AC%EF%BC%96%EF%BC%96%E5%9B%9E%E8%BF%91%E4%BB%A3%E4%BA%94%E7%A8%AE%E5%85%A8%E6%97%A5%E6%9C%AC%E9%81%B8%E6%89%8B%E6%A8%A9%E5%A4%A7%E4%BC%9A/', true),
  ('第13回近代３種日本選手権大会 兼 第20回JOCジュニアオリンピックカップ', 'competition', '2026-11-27T15:00:00.000Z', null, 'リソルの森メディカルトレーニングセンター（千葉県長生郡）', '日本近代五種協会が主催する近代３種の日本選手権です。エントリーの締切は2026年10月31日（土）23:59です。大会要項は協会サイトの記事をご確認ください。', 'https://pentathlon.jp/news/%E7%AC%AC%EF%BC%96%EF%BC%96%E5%9B%9E%E8%BF%91%E4%BB%A3%E4%BA%94%E7%A8%AE%E5%85%A8%E6%97%A5%E6%9C%AC%E9%81%B8%E6%89%8B%E6%A8%A9%E5%A4%A7%E4%BC%9A/', true);

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
