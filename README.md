# ペンタスロンアカデミー 公式サイト

近代五種競技アカデミーの公式サイト。公開ページ7つと、スタッフが自分で更新できる管理画面で構成しています。

## 構成

| | |
| --- | --- |
| フレームワーク | Next.js 16 (App Router) / React 19 / TypeScript |
| スタイル | Tailwind CSS v4（設定ファイルなし。トークンは `app/src/app/globals.css`） |
| DB / 認証 | Supabase |
| デプロイ | Vercel |

```
pentathlon-academy/
├── app/                  Next.js プロジェクト
│   ├── scripts/          ロゴから競技アイコンを生成するスクリプト
│   └── src/
│       ├── app/(site)/   公開ページ7つ
│       ├── app/admin/    管理画面
│       ├── components/
│       ├── lib/
│       └── types/
├── docs/                 セットアップ手順
└── supabase/migrations/  DB スキーマ
```

## 動かす

```bash
npm install --prefix app
npm run dev --prefix app
```

**Supabase を設定しなくても全ページ表示できます。** 環境変数が無いあいだは
`app/src/lib/db/seed.ts` の仮データが使われます。

この状態でできないことは、管理画面 `/admin` へのログインと、お問い合わせフォームの送信の2つだけです。

## セットアップ

Supabase の接続、スタッフアカウントの発行、デプロイの手順は
[docs/SETUP.md](docs/SETUP.md) を参照してください。

## 競技アイコンについて

`app/public/icons/*.png`（競技ごとの面）は、白地のロゴ `app/assets/logo-flat.jpg` から自動生成しています。
ヘッダーのロゴ・ファビコン・OGP は、黒地・発光版のロゴ `app/public/logo.png` から作っています。
ロゴを差し替えたときだけ再実行してください。

```bash
node scripts/prepare-logo-pieces.mjs   # 競技ごとの面（app/ で実行）
node scripts/prepare-logo-glow.mjs     # ヘッダーのロゴ・ファビコン・OGP
node scripts/check-wedges.mjs          # 生成結果の目視確認
```

## 注意

現在は文言・写真・連絡先の一部が仮のものです。差し替えが必要な箇所は
[docs/SETUP.md](docs/SETUP.md) の一覧にまとめています。

公開までにオーナーへ確認が必要な項目は [docs/HEARING.md](docs/HEARING.md) にまとめています。
