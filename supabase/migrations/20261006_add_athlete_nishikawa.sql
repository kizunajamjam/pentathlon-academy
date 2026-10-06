-- 強化選手に西川陽治（オブスタクルA指定）を追加する。
insert into public.athletes (name, discipline, designation, records, sort_order, is_published) values
  ('西川陽治', 'obstacle', 'オブスタクルA指定', '[{"event":"第2回OCR100m日本選手権 ユース","time":"7位"}]'::jsonb, 10, true);
