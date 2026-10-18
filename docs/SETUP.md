# ペンタスロンアカデミー HP セットアップ手順

## 構成

| | |
| --- | --- |
| フレームワーク | Next.js 16.3.1 (App Router) / React 19 / TypeScript |
| スタイル | Tailwind CSS v4（設定ファイルなし。トークンは `src/app/globals.css` の `@theme`） |
| DB / 認証 | Supabase |
| デプロイ | Netlify（サイト本体）／ Cloudflare（DNS・メール転送） |

ディレクトリは `school-app` と同じ流儀に揃えてある（`app/` が Next.js 本体、`docs/`・`supabase/` はその兄弟）。

```
pentathlon-academy/
├── app/                    Next.js プロジェクト
│   └── src/
│       ├── app/
│       │   ├── (site)/     公開ページ7つ
│       │   └── admin/      管理画面
│       ├── components/
│       ├── lib/{supabase,db,constants,utils}/
│       └── types/
├── docs/
└── supabase/migrations/
```

## 1. 起動する

```bash
npm run dev --prefix pentathlon-academy/app
```

**Supabase を設定しなくても全ページ表示できる。** 環境変数が無いあいだは
`src/lib/db/seed.ts` の仮データが使われる（`src/lib/supabase/config.ts` で切り替え）。
デザインと文言の確認はこの状態で進められる。

この状態でできないことは2つだけ:

- 管理画面 `/admin` へのログイン
- お問い合わせフォームの送信（電話・メールへ誘導するメッセージが出る）

## 2. Supabase をつなぐ

1. Supabase で新規プロジェクトを作成する
2. SQL Editor で `supabase/migrations/` のファイルを **日付の古い順に全部** 実行する
   （`20260815_initial_schema.sql` → `20261004_content_tables.sql` → `20261005_inquiry_analytics.sql`）。
   2つ目は指導者・強化選手・お知らせ画像の追加で、現在サイトに載っている指導者と強化選手が初期データとして入る
3. `app/.env.local` を作る（`app/.env.example` をコピー）

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxx
```

4. dev サーバーを再起動する

これで お知らせ・スケジュール・イベント が DB 参照に切り替わる。
最初は空なので、管理画面から登録するまで各ページは「まだありません」と表示される。

## 3. 管理画面に入れるようにする

スタッフ判定は `staff` テーブルの allowlist で行っている。
「ログインできる＝編集できる」ではないので、**2ステップ必要**。

1. Supabase ダッシュボード → Authentication → Users → **Add user**
   （メールアドレスとパスワードを決めて発行する）
2. SQL Editor で、その user を staff に登録する

```sql
insert into public.staff (user_id, name)
select id, '山田 太郎' from auth.users where email = 'staff@example.com';
```

**Authentication → Providers → Email の「Enable sign-ups」は必ず OFF にする。**
（アカウント発行はダッシュボードからのみ行う運用にするため）

`/admin/login` からログインすると管理画面に入れる。

### メールアドレス・パスワードの変更

ログイン後、画面右上の「アカウント」（スマホは人型のアイコン）から変更できる。

- **パスワード**: 今のパスワードと新しいパスワード（12文字以上）を入れる。変更すると、ほかの端末でのログインは終了する
- **メールアドレス**: 新しいアドレスと今のパスワードを入れると、確認メールが届く。リンクを開くと変更が完了する
  （Supabase の「Secure email change」が有効なら、新旧両方のアドレスに届くので両方開く）
- **パスワードを忘れたとき**: ログイン画面の「パスワードを忘れた方」から再設定メールを送る。
  リンクは**申し込んだのと同じブラウザ**で開く。認証アプリのコードを入れたあと、15分以内なら今のパスワードなしで新しく決められる

メールのリンクを使うには、Supabase 側で次の2つが必要。

1. **Authentication → URL Configuration → Redirect URLs** に `（サイトのURL）/admin/auth/callback` を追加する
   （手元で試すなら `http://localhost:3000/admin/auth/callback` も）。戻り先は `NEXT_PUBLIC_SITE_URL` から作る
2. **Authentication → Emails → SMTP Settings** で自前の送信元を設定する。
   Supabase 標準の送信は、プロジェクトのメンバー宛てにしか届かず、1時間に数通までしか送れない

### 公開ページへの反映について

公開ページは表示を速くするため、作ったものを使い回している（5分ごとに作り直す）。
管理画面で保存・削除したときはその場で作り直されるので、すぐサイトに反映される。

### 公開前の見た目を確かめる（プレビュー）

お知らせ・大会の編集画面の右上にある「プレビュー」を押すと、保存済みの内容を
公開ページと同じ見た目で別タブに開く。下書き・予約中でも見られる（ログイン中のスタッフだけ）。
編集したら、いったん保存してから開くこと。

## 4. お問い合わせの通知メール（任意）

問い合わせは **必ず DB に保存され、管理画面 `/admin/inquiries` から確認できる**。
メールはあくまで補助なので、設定しなくても運用できる。

通知を受け取りたい場合は [Resend](https://resend.com) でドメイン認証のうえ、
3つとも設定する（1つでも欠けると送信をスキップする）:

```
RESEND_API_KEY=re_xxxx
CONTACT_NOTIFY_TO=info@example.com
CONTACT_NOTIFY_FROM=no-reply@（認証済みドメイン）
```

## 5. お問い合わせの強化（任意・公開前に推奨）

初期状態では、フォームの保存を匿名ユーザーの insert 権限で行っている。
次の2つを設定すると、スパムの直接投稿を防げる。

**Turnstile（bot 対策）**: [Cloudflare Turnstile](https://www.cloudflare.com/ja-jp/application-services/products/turnstile/) でサイトを登録し、
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` と `TURNSTILE_SECRET_KEY` を設定する。フォームにチェックが出る。

**匿名の insert を閉じる**: `SUPABASE_SERVICE_ROLE_KEY`（Supabase → Settings → API Keys の secret key）を
**サーバー側の環境変数にだけ** 登録する。設定するとフォームの保存はこのキーで行われるので、
続けて SQL Editor で次を実行し、anon キーでの直接投稿を禁止する。

```sql
drop policy inquiries_insert_anon on public.inquiries;
revoke insert on table public.inquiries from anon;
```

※ 先にキーを登録してデプロイし、フォームが送信できることを確かめてから実行すること。

**送信回数の制限**: `SUPABASE_SERVICE_ROLE_KEY` を登録すると、10分あたり「同じメールアドレスから3件」を
超える送信を断るようになる。また全体で20件を超えたら、保存は続けたまま通知メールだけを止める
（受信箱が埋まるのを防ぐ。全体で断ると、誰かの連投で正規の問い合わせまで受け付けなくなるため）。
キーが無いあいだは件数を数えられないため、この制限はかからない。

このほか、設定に関係なく次の2つは常に効いている。

- ハニーポット（人には見えない入力欄。bot が埋めると送信を黙って捨てる）
- 入力時間の確認（フォームを開いてから3秒未満の送信は保存せず、もう一度押してもらう）

## 6. アクセス解析と分析（任意）

- ページごとのアクセス数・流入元: [Plausible](https://plausible.io) にドメインを登録し、
  `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` を設定する。お問い合わせの送信は `inquiry_submit` イベントとして記録される
  （Plausible の Goals に `inquiry_submit` を追加すると集計される）。
- お問い合わせの集計: 管理画面の「分析」で、週ごとの件数・種別・流入元・対応までの時間を見られる。
  CSV で保存もできる。
- SNS などに載せるリンクには `?utm_source=instagram` のように付けると、流入元がその名前で集計される。

## 7. デプロイ（Netlify ＋ Cloudflare）

ランニングコストを抑えるため、どれも無料プランで運用する（かかるのはドメイン代のみ）。

| 役割 | サービス |
| --- | --- |
| サイト本体 | Netlify（無料プランでも商用利用可。Next.js に標準対応） |
| DNS・独自ドメインのメール転送 | Cloudflare（無料） |
| DB・認証 | Supabase（無料） |
| ドメイン | お名前.com で取得（レンタルサーバーは不要） |

### Netlify

1. Netlify に GitHub アカウントでログインし、「Add new site → Import an existing project」でこのリポジトリを選ぶ
2. ビルド設定はリポジトリ直下の `netlify.toml` が読まれるので、画面では何も変えなくてよい
3. 「Site configuration → Environment variables」に `.env.example` の値を登録する
   - Supabase の2つが未設定だとビルドが失敗する（仮データを本番に出さないため）
   - `NEXT_PUBLIC_SITE_URL` は `https://pentathlon-academy.com`（sitemap.xml / robots.txt / OGP が参照する）
   - `NEXT_PUBLIC_IS_PREVIEW` は**入れない**（入れると検索エンジンに載らなくなる）
4. 「Domain management」で `pentathlon-academy.com` を追加する

### Cloudflare

1. Cloudflare に `pentathlon-academy.com` を追加し、表示されたネームサーバー2つを
   お名前.com の「ネームサーバーの変更」に登録する
2. DNS に Netlify 向けのレコードを追加する（Netlify の Domain management に表示される値）
   - プロキシ（オレンジの雲）は**オフ**にする。Netlify 側で SSL 証明書を発行するため
3. メールを受けたい場合は「Email Routing」で `info@pentathlon-academy.com` などを
   普段使いのアドレスへ転送する

### 協会サイトの新着チェック（週1回）

`.github/workflows/federation-news.yml` が毎週月曜 9:07（JST）に日本近代五種協会のお知らせを確認し、
直近7日間に大会関連の記事があれば管理者に知らせる（大会の登録自体は管理画面から手で行う）。

- 何も設定しなければ、GitHub の Issue として届く（リポジトリの持ち主に GitHub から通知メールが届く）
- メールで受け取りたい場合は、GitHub の「Settings → Secrets and variables → Actions」に3つ登録する
  - `RESEND_API_KEY`（お問い合わせ通知と同じキーでよい）
  - `NOTIFY_TO`（受け取るアドレス。カンマ区切りで複数可）
  - `NOTIFY_FROM`（Resend で認証したドメインのアドレス。例: `no-reply@pentathlon-academy.com`）
- 「Actions → Check federation news → Run workflow」で、いつでも手動で実行できる
- 協会サイトの作りが変わって読み取れなくなった場合も、その旨が届く

### 確認用プレビュー（GitHub Pages）

役目を終えたので、`.github/workflows/pages.yml` はプレビューを作らず、
本番（https://pentathlon-academy.com）への転送ページだけを公開するようにした。
古い URL を開くと、同じページの本番 URL へ移動する。毎日の作り直しもやめた。

完全に止めるには、GitHub → Settings → Pages で公開を無効にし、`pages.yml` を削除する。

---

## 差し替えが必要な箇所（仮のまま入っているもの）

オーナーに確認して埋める項目は [HEARING.md](HEARING.md) にまとめてある。

| 対象 | 場所 |
| --- | --- |
| 連絡先・住所・電話・メール | `src/lib/constants/site.ts` の `SITE` |
| 各ページの文言 | `src/lib/constants/site.ts` と各 `page.tsx`（`⚠️ 仮テキスト` コメント付き） |
| 写真 | `<PhotoSlot />` で grep。`next/image` に置き換える |
| ロゴ | `src/components/layout/site-logo.tsx`。正式SVGを `public/logo.svg` に置いて差し替え |
| 仮データ | `src/lib/db/seed.ts`（Supabase 接続後は不要。削除してよい） |
| 大会日程 | 管理画面の「大会・イベント」。`src/lib/db/seed.ts` の `SEED_EVENTS` は未接続時の仮データ。下記参照 |
| 指導者・強化選手 | 管理画面の「指導者」「強化選手」で更新。`site.ts` の `COACHES` / `ATHLETES` は未接続時の表示用 |

### 大会の日程について

`SEED_EVENTS` の「大会」は日本近代五種協会（pentathlon.jp）の公表分を
2026-08-15 時点で転記したもの。**自動では更新されない。**
協会の日程は随時変わるので、Supabase 接続後は管理画面から登録・更新すること。

大会には外部リンク（`url`）を持たせてあり、入力すると
カードに「大会の詳細・要項」ボタンが出る。要項は協会側が持っているので、
こちらで詳細を書き写さずリンクで渡す方針。

開始時刻が未公表の大会は、時刻を **00:00（JST）** で登録する。
そうすると日付だけの表示になり、時刻を捏造せずに済む
（`formatEventPeriod` がこの約束で出し分けている）。
| 本番ドメイン | `src/app/layout.tsx` の `metadataBase`、`NEXT_PUBLIC_SITE_URL` |

### ロゴについて

現在はロゴの五角形5分割の構造を SVG で再現した暫定マークが入っている。
配置は実物と同じ（左上=走／右上=フェンシング／右=射撃／下=オブスタクル／左=水泳）。

正式ロゴを受け取る際は **SVG 形式**が望ましい（拡大しても劣化せず、
配色をトークンから流し込めるため）。あわせて以下があるとよい:

- `favicon.ico` 用の正方形版
- OGP画像用の横長版（1200×630）

## 配色トークン

ロゴから採った5色を `src/app/globals.css` の `@theme` に定義している。
コンポーネント側で16進数を直書きしないこと。ここを直せば全体に反映される。

| 用途 | トークン | 値 |
| --- | --- | --- |
| 主色（走・ロゴタイプ） | `navy-800` | `#17233f` |
| 強調色（フェンシング・星） | `gold-500` | `#c79a3e` |
| 水泳 | `swim-500` | `#1e5ba8` |
| 射撃 | `shoot-500` | `#9c2333` |
| オブスタクル | `obstacle-500` | `#12543a` |

### 競技アイコンについて

単独の競技アイコン `public/icons/{競技}.png` は、白地のロゴ（`assets/logo-flat.jpg`）の五角形の各面を、金の縁ごと切り出したもの。
生成は `node scripts/prepare-logo-pieces.mjs`（ロゴを差し替えたときだけ再実行）。
トップのロゴの組み上がりに使う `overlay-*.png`・`center-*.png` は発光版から `node scripts/prepare-logo-glow.mjs` で作る。

切り出しは画像から各面の境目を検出し、直線を当てはめた多角形で行う。手動調整の座標は無い。
`DEBUG_DIR=/tmp/pieces` を付けて実行すると、検出した多角形と組み上げ結果の確認用画像が出る。

1. 背景でない画素の連結領域を洗い出す
2. 大きい順に5つ取る（面のあいだは白い隙間で切れているので必ず分かれ、
   中央の「P」と星はひと回り小さい別領域になるので自然に外れる）
3. 各領域の凸包を取る

各面は凸な四角形なので、凸包がそのまま塗りの輪郭になる。内側の白い選手
シルエットは凸包の内側なので取り込まれ、隙間と中央の白地は入らない。

競技の割り当ては、五角形の中心から見た各領域の角度で決めている。
実行時に想定角度とのズレを表示し、30°以上ずれた場合はエラーで止まる。

ロゴを差し替えたら必ず目視確認すること:

```bash
node scripts/check-wedges.mjs
```

`_wedge-*.png` が生成され、色地の上に載せた状態で確認できる。
選手が欠けていないか、「P」や星が写り込んでいないかを見る。

なお面の境界には白の残りがあるため、**アイコンは白いカードなど明るい背景に置く**こと。
色地に置くと白い筋が見える。48px 以下ではシルエットが潰れるので、
小さく示す箇所では `DISCIPLINES` の `chip`（色の丸）を使う。

なお **馬術は2028年ロサンゼルス五輪から廃止され、オブスタクルに置き換わっている**。
いただいたロゴも新形式（緑の面が壁を登る選手）で描かれているため、
サイトの5種目もそれに合わせている。
