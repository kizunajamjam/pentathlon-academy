# ペンタスロンアカデミー HP セットアップ手順

## 構成

| | |
| --- | --- |
| フレームワーク | Next.js 16.3.1 (App Router) / React 19 / TypeScript |
| スタイル | Tailwind CSS v4（設定ファイルなし。トークンは `src/app/globals.css` の `@theme`） |
| DB / 認証 | Supabase |
| デプロイ想定 | Vercel |

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
2. SQL Editor で `supabase/migrations/20260815_initial_schema.sql` を実行する
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

## 5. デプロイ（Vercel）

- Root Directory に `pentathlon-academy/app` を指定する
- 環境変数は `.env.example` と同じものを登録する
- `NEXT_PUBLIC_SITE_URL` に本番URLを入れる（sitemap.xml / robots.txt が参照する）
- `src/app/layout.tsx` の `metadataBase` を本番ドメインに直す

---

## 差し替えが必要な箇所（仮のまま入っているもの）

| 対象 | 場所 |
| --- | --- |
| 連絡先・住所・電話・メール | `src/lib/constants/site.ts` の `SITE` |
| 各ページの文言 | `src/lib/constants/site.ts` と各 `page.tsx`（`⚠️ 仮テキスト` コメント付き） |
| 写真 | `<PhotoSlot />` で grep。`next/image` に置き換える |
| ロゴ | `src/components/layout/site-logo.tsx`。正式SVGを `public/logo.svg` に置いて差し替え |
| 仮データ | `src/lib/db/seed.ts`（Supabase 接続後は不要。削除してよい） |
| 大会日程 | `src/lib/db/seed.ts` の `SEED_EVENTS`。下記参照 |

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
配置は実物と同じ（左上=走／右上=フェンシング／右=射撃／下=障害物レース／左=水泳）。

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
| 障害物レース | `obstacle-500` | `#12543a` |

### 競技アイコンについて

`public/icons/*.png` はロゴの五角形の各面を切り出したもの。
生成は `node scripts/prepare-logo.mjs`（ロゴを差し替えたときだけ再実行）。

切り出しは画像から実際の塗り範囲を検出して行う。手動調整の定数は無い。

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

なお **馬術は2028年ロサンゼルス五輪から廃止され、障害物レースに置き換わっている**。
いただいたロゴも新形式（緑の面が壁を登る選手）で描かれているため、
サイトの5種目もそれに合わせている。
