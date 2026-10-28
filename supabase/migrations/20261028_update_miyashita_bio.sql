-- 宮下裕策さんの経歴の書き方を直す（オーナー確認済み。site.ts の COACHES と同じ内容）。
-- 「脳神経外科専攻（令和9年度付）」→「令和9年度より脳神経外科専攻予定」
-- 置き換えなので、何度実行しても結果は同じ。
update public.coaches
  set bio = array_replace(bio, '脳神経外科専攻（令和9年度付）', '令和9年度より脳神経外科専攻予定'), updated_at = now()
  where '脳神経外科専攻（令和9年度付）' = any (bio);
