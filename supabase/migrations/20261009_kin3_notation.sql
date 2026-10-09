-- 「近代三種」を正式表記の「近代３種」にそろえる（site.ts の COACHES と同じ内容）。
update public.coaches
  set bio = array_replace(bio, '近代三種日本選手権優勝', '近代３種日本選手権優勝'), updated_at = now()
  where '近代三種日本選手権優勝' = any (bio);
