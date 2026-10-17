import type { Inquiry, News } from "@/types";

/*
 * 管理画面のデモ版（lib/supabase/config.ts の isAdminDemo）だけで使う見本データ。
 * 本物と取り違えないよう、タイトルや名前に「サンプル」「デモ」と入れ、
 * メールアドレスは例示用の example.com にしている。
 */
const ago = (days: number, hours = 0) =>
  new Date(Date.now() - (days * 24 + hours) * 3600_000).toISOString();

export const DEMO_NEWS: News[] = [
  {
    id: "demo-news-1",
    title: "【サンプル】ホームページを公開しました",
    category: "notice",
    body: "これはデモ版の見本のお知らせです。\n管理画面の「お知らせ」から、本文・種別・公開日時・画像を編集できます。",
    publishedAt: ago(3),
    isPublished: true,
    imageUrl: null,
  },
  {
    id: "demo-news-2",
    title: "【サンプル】下書きのお知らせ",
    category: "report",
    body: "「サイトに公開する」のチェックを外して保存すると、このように下書きになります。\n下書きはサイトには出ませんが、編集画面の「プレビュー」から見た目を確認できます。",
    publishedAt: ago(0),
    isPublished: false,
    imageUrl: null,
  },
];

export const DEMO_INQUIRIES: Inquiry[] = [
  {
    id: "demo-inquiry-1",
    name: "デモ 太郎",
    email: "taro@example.com",
    phone: null,
    category: "体験・見学のお申し込み",
    message: "（サンプル）小学5年生の息子が水泳を続けています。体験に参加できる日を教えてください。",
    isHandled: false,
    createdAt: ago(0, 5),
    source: "instagram",
    landingPath: "/",
    handledAt: null,
  },
  {
    id: "demo-inquiry-2",
    name: "デモ 花子",
    email: "hanako@example.com",
    phone: "000-0000-0000",
    category: "料金について",
    message: "（サンプル）施設利用料などの実費は、月にどのくらいかかりますか。",
    isHandled: true,
    createdAt: ago(4),
    source: "google.com",
    landingPath: "/about",
    handledAt: ago(3, 20),
  },
  {
    id: "demo-inquiry-3",
    name: "デモ 株式会社",
    email: "info@example.com",
    phone: null,
    category: "スポンサー・協賛について",
    message: "（サンプル）スポンサー募集のページを拝見しました。詳しいお話を伺えますか。",
    isHandled: false,
    createdAt: ago(9),
    source: null,
    landingPath: "/sponsor",
    handledAt: null,
  },
];
