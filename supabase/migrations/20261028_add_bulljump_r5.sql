-- 大会・イベントに「ブルジャンプCUP2026 第5回 長崎県大村市ラウンド」（2026-10-18）を追加する。
-- 協会サイトの「全5大会が終了、リザルト公開」（2026-10-18）で確認した、まだ載せていなかった回。
-- 日付のみ（開始時刻は非公表）なので 00:00 JST。リンクは第2〜4回と同じ協会の記事（リザルトが載っている）。
insert into public.events (title, category, starts_at, ends_at, location, description, url, is_published) values
  ('ブルジャンプCUP2026 第5回 長崎県大村市ラウンド', 'competition', '2026-10-17T15:00:00.000Z', null, '長崎県大村市', '日本近代五種協会が主催した近代３種のシリーズ戦です。', 'https://pentathlon.jp/news/%e8%bf%91%e4%bb%a33%e7%a8%ae%e3%82%b7%e3%83%aa%e3%83%bc%e3%82%ba%e3%80%8c%e3%83%96%e3%83%ab%e3%82%b8%e3%83%a3%e3%83%b3%e3%83%97cup2026%e3%80%8d%e9%96%8b%e5%82%ac%e6%b1%ba%e5%ae%9a/', true);
