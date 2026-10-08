# 本番リリース手順（今夜の作業用）

ドメイン `pentathlon-academy.com` で本番公開するまでの手順。上から順に進める。
所要時間の目安は 1.5〜2 時間（ネームサーバーの切り替え待ちを除く）。

| 役割 | サービス | 費用 |
| --- | --- | --- |
| ドメイン | お名前.com | 初年度 1円＋税、2年目から年1,500〜2,000円程度 |
| DNS・メール転送 | Cloudflare | 無料 |
| サイト本体 | Netlify | 無料 |
| データベース・ログイン | Supabase | 無料 |

> 途中で分からなくなったら、その画面のスクリーンショットを Claude に送れば続きを案内できる。
> パスワードや API キー（`sb_secret_...` など）は、スクリーンショットに写さないこと。

---

## 1. ドメインを取る（お名前.com）

- [ ] `pentathlon-academy.com` を購入する
  - **レンタルサーバーは「削除」**（月額がかかるうえ、このサイトでは使えない）
  - オプション（ネットde診断／Whois代行転送／ドメインプロテクション）は**すべてチェックしない**
  - 合計が「1円＋税」程度になっていることを確認してから申し込む
- [ ] 購入後に届く **「ドメイン情報認証」メールのリンクを必ず押す**
  （放置すると、しばらくしてドメインが止められる）
- [ ] お名前.com のアカウントで **二段階認証をオン** にする（乗っ取り防止。無料）

## 2. Cloudflare にドメインを登録する

ネームサーバーの切り替えに数時間かかることがあるので、**先にここまで進めておく**。

- [ ] Cloudflare のアカウントを作る（無料）
- [ ] 「Add a domain（サイトを追加）」で `pentathlon-academy.com` を入力 → **Free プラン**を選ぶ
- [ ] 画面に表示される **ネームサーバー2つ**（`○○.ns.cloudflare.com` の形）を控える
- [ ] お名前.com Navi → 「ネームサーバーの設定」→「ネームサーバーの変更」→「他のネームサーバーを利用」に、
      控えた2つを入力して保存する
- [ ] Cloudflare の画面で「Check nameservers」を押す（反映まで数分〜最大24時間。待つ間に次へ進んでよい）

## 3. データベースを作る（Supabase）

- [ ] Supabase のアカウントを作り、「New project」
  - 名前: `pentathlon-academy`／Region: **Northeast Asia (Tokyo)**／データベースのパスワードは控えておく
- [ ] 左メニュー **SQL Editor** → 「New query」に、リポジトリの
      [`supabase/setup_all.sql`](../supabase/setup_all.sql) の**全文**を貼り付けて「Run」
  - 「Success. No rows returned」と出れば成功。**2回は実行しない**（大会などが重複する）
- [ ] **Authentication → Sign In / Providers → Email** の「Allow new users to sign up」を **OFF**
- [ ] **Authentication → Users → Add user** で、管理画面に入る人のアカウントを作る
      （メールアドレスとパスワード。「Auto Confirm User」にチェック）
- [ ] SQL Editor で、その人を管理者として登録する（メールアドレスと名前を書き換えて実行）

  ```sql
  insert into public.staff (user_id, name)
  select id, '小路 瑛' from auth.users where email = 'ここにメールアドレス';
  ```

- [ ] **Authentication → URL Configuration** の Site URL を `https://pentathlon-academy.com` にする
- [ ] **Project Settings → API**（または Data API）で次の2つを控える
  - Project URL（`https://xxxx.supabase.co`）
  - anon / publishable key（`sb_publishable_...` または `eyJ...` で始まるもの）
  - ※ `service_role` / `sb_secret_...` は**控えなくてよい**（使う場合も絶対に公開しない）

## 4. サイトを公開する（Netlify）

- [ ] Netlify に **GitHub アカウントでログイン**
- [ ] 「Add new project → Import an existing project → GitHub」で `pentathlon-academy` を選ぶ
  - ビルド設定はリポジトリの `netlify.toml` が読まれるので、**画面では何も変えない**
- [ ] デプロイの前に（または直後に）**Environment variables** に3つ登録する

  | キー | 値 |
  | --- | --- |
  | `NEXT_PUBLIC_SUPABASE_URL` | 3で控えた Project URL |
  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 3で控えた anon / publishable key |
  | `NEXT_PUBLIC_SITE_URL` | `https://pentathlon-academy.com` |

  - `NEXT_PUBLIC_IS_PREVIEW` は**入れない**（入れると検索エンジンに載らなくなる）
- [ ] 「Deploy」→ 数分待つ。失敗したら **Deploy log の最後の30行** を Claude に送る
- [ ] 発行された `https://〇〇.netlify.app` を開き、下の「6. 公開後の確認」をひととおり試す

## 5. ドメインをつなぐ（Netlify ＋ Cloudflare）

2 のネームサーバー切り替えが終わっている（Cloudflare の画面が Active になっている）ことが前提。

- [ ] Netlify → 対象サイト → **Domain management → Add a domain** に `pentathlon-academy.com` を入力
  - 「Add domain」→ 外部 DNS を使う旨の確認が出たら、そのまま進める
- [ ] Netlify に表示される DNS の値を見ながら、Cloudflare → **DNS → Records** に2つ追加する

  | Type | Name | Content | Proxy status |
  | --- | --- | --- | --- |
  | CNAME | `@` | `〇〇.netlify.app` | **DNS only（灰色の雲）** |
  | CNAME | `www` | `〇〇.netlify.app` | **DNS only（灰色の雲）** |

  - **オレンジの雲（Proxied）にはしない**。Netlify 側で SSL 証明書を発行するため
- [ ] Netlify の Domain management で、`pentathlon-academy.com` が **Primary domain** になっていること、
      HTTPS の証明書が発行されたこと（数分〜1時間）を確認する

## 6. 公開後の確認

`https://pentathlon-academy.com` で次を確認する。

- [ ] トップ・アカデミーについて・トレーニング・練習スケジュール・強化選手・大会・イベント・観戦ガイド・古代五種・お問い合わせ・コーチ・スタッフ募集が開く
- [ ] 練習スケジュールに9枠、大会・イベントに開催予定と過去の大会が出ている
- [ ] アカデミーについてに指導者5名・スタッフ・顧問が出ている。強化選手に2名出ている
- [ ] お問い合わせフォームから**テスト送信**できる → 管理画面のお問い合わせに届いている
- [ ] `/admin/login` から3で作ったアカウントでログインできる
- [ ] 管理画面で大会を1件「非公開」で作って、保存・削除できる
- [ ] スマホで表示が崩れていない

## 7. メールの転送（任意・今夜でなくてよい）

`info@pentathlon-academy.com` 宛てのメールを、今の Gmail に転送する。

- [ ] Cloudflare → **Email → Email Routing** →「Get started」
- [ ] Custom address に `info`、Destination に `pentathlonacademy.jp@gmail.com` を入れる
- [ ] Gmail に届く確認メールのリンクを押す
- [ ] 別のアドレスから `info@pentathlon-academy.com` に送って、Gmail に届くことを確認する
- [ ] 届いたら Claude に「サイトのメールを info@ に変えて」と伝える（サイト側の表示を差し替える）

## 8. 後日でよいもの

| 内容 | 効果 | 手順 |
| --- | --- | --- |
| お問い合わせの通知メール（Resend） | 問い合わせが来たらメールで知らせる。未設定でも管理画面には届く | [SETUP.md](SETUP.md) の「お問い合わせの通知メール」 |
| 協会サイトの新着をメールで受け取る | 週1回のチェック結果をメールで受け取る（未設定なら GitHub から通知） | [SETUP.md](SETUP.md) の「協会サイトの新着チェック」 |
| スパム対策（Cloudflare Turnstile） | フォームへの機械的な送信を防ぐ | [SETUP.md](SETUP.md) の「お問い合わせの強化」 |
| 確認用サイト（GitHub Pages）を止める | 本番と二重に存在しないようにする | GitHub → Settings → Pages を無効にし、`.github/workflows/pages.yml` を削除 |
