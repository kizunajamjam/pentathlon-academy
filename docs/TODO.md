# 公開後に残っている作業

サイトは `https://pentathlon-academy.com` で公開済み（2026年10月）。ここには、そのあとに残っている作業をまとめる。
オーナーへの確認事項は [HEARING-next.txt](HEARING-next.txt) にある。

済んだ項目はチェックを入れるか、行ごと消す。

---

## 1. データベース（Supabase の SQL Editor）

### 反映済みか確かめる SQL

本番の DB は `setup_all.sql` で作ったが、作った日によっては、そのあとに追加したマイグレーションが入っていない。
次の SQL で確かめる。**読み取りだけで、何も変えない。**

```sql
select
  exists (select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'staff' and column_name = 'role') as "1019_ロール",
  position('aal2' in pg_get_functiondef('public.is_staff()'::regprocedure)) > 0 as "1014_二段階認証",
  (select file_size_limit from storage.buckets where id = 'news-images') = 4194304 as "1014_画像の制限",
  exists (select 1 from pg_policies where tablename = 'inquiries'
          and policyname = 'inquiries_insert_anon') as "匿名での送信を許す設定が残っている";
```

- [ ] 上の SQL を実行して結果を見る
- [ ] `1014_*` が false なら [`20261014_security_hardening.sql`](../supabase/migrations/20261014_security_hardening.sql) を1回実行する
- [ ] `1019_ロール` が false なら（1014 のあとに）[`20261019_staff_roles.sql`](../supabase/migrations/20261019_staff_roles.sql) を1回実行する
  - 今いるスタッフは全員が管理者になる
  - 今のサイトはロールがある前提で動いているので、これが無いと管理画面の「スタッフの管理」がエラーになる
- **`setup_all.sql` はもう実行しない**（初期データが重複する）
- 10/09 以前のマイグレーションは `setup_all.sql` に含まれている。それ以降、指導者・強化選手のデータを変えたコミットは無い

### スタッフを確かめる

誰が管理画面に入れるかを見る。オーナーに管理画面を説明するときに、入る人（C-4）と認証アプリの登録（E-18）もあわせて確かめる。

```sql
select s.name, s.role, u.email from public.staff s join auth.users u on u.id = s.user_id;
```

### 匿名での送信を閉じる（3 の `SUPABASE_SERVICE_ROLE_KEY` のあと）

- [ ] キーを登録して再デプロイし、フォームから送れることを確かめてから、次を実行する

```sql
drop policy inquiries_insert_anon on public.inquiries;
revoke insert on table public.inquiries from anon;
```

## 2. Supabase の設定画面

[RELEASE.md](RELEASE.md) の 3 のうち、認証まわりの設定。済んだか確かめる。

- [ ] **Authentication → Emails → SMTP Settings** に Resend などの送信元を設定する
  （無いと、招待・パスワード再設定・メールアドレス変更のメールがスタッフに届かない）
- [ ] **Authentication → Emails → Invite user** の本文のリンクを差し替える（[SETUP.md](SETUP.md) の 3章）
- [ ] **Authentication → URL Configuration** の Redirect URLs に `https://pentathlon-academy.com/admin/auth/callback` を追加する
- [ ] **Authentication → Sign In / Providers → Email** の「Allow new users to sign up」を OFF にする
- [ ] 同じ画面でパスワードを12文字以上・英字（大小）・数字・記号にする

## 3. Netlify の環境変数

登録したら再デプロイする。

- [ ] `SUPABASE_SERVICE_ROLE_KEY`（Supabase → Settings → API Keys の secret key）。**`NEXT_PUBLIC_` は付けない**
  - 管理画面からスタッフを招待できるようになる
  - お問い合わせの送信回数の制限がかかるようになる
- [ ] 任意: `RESEND_API_KEY` / `CONTACT_NOTIFY_TO` / `CONTACT_NOTIFY_FROM`（お問い合わせの通知メール）
- [ ] 任意: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`（迷惑送信対策）
- [ ] 任意: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`（アクセス解析）

## 4. アカウントの守り

[RELEASE.md](RELEASE.md) の 7。

- [ ] GitHub・Netlify・Supabase・Cloudflare・お名前.com・Gmail の6つで二段階認証をオンにする
- [ ] 各サービスのバックアップコードを保存する

## 5. GitHub・Cloudflare

- [ ] 協会サイトの新着の Issue（#12 など）を見て、載せる大会があれば管理画面から登録し、Issue を閉じる
- [ ] 任意: GitHub → Settings → Pages を無効にし、`.github/workflows/pages.yml` を削除する
- [ ] 任意: 協会サイトの新着をメールで受け取る（GitHub の Actions secrets に `RESEND_API_KEY` / `NOTIFY_TO` / `NOTIFY_FROM`）
- [ ] オーナーが問16（メールアドレス）で「作る」と答えたら: Cloudflare の Email Routing で `info@pentathlon-academy.com` を Gmail に転送し、
      サイトに載せるメールアドレスを差し替える（[RELEASE.md](RELEASE.md) の 8）

## 6. オーナーの回答が来たら

[HEARING-next.txt](HEARING-next.txt) の回答をサイトに反映する。差し替え先のファイルは
[HEARING.md](HEARING.md) の最後の「作業用メモ」にある。
