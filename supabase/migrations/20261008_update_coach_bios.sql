-- 指導者の経歴を更新する（site.ts の COACHES と同じ内容）。
-- 竹上譲一: 「2027 HYROX OSAKA SINGLE PRO」を削除
update public.coaches
  set bio = array_remove(bio, '2027 HYROX OSAKA SINGLE PRO'), updated_at = now()
  where name = '竹上譲一';

-- 小路瑛: JOC表彰を一番下へ移動
update public.coaches
  set bio = array_append(
        array_remove(bio, 'オリンピック有望選手育成指導者としてJOCより表彰（2013年）'),
        'オリンピック有望選手育成指導者としてJOCより表彰（2013年）'),
      updated_at = now()
  where name = '小路瑛';
