import type { Inquiry } from "../../types/index.ts";

/*
 * お問い合わせの集計。管理画面の「分析」と同じ数字を、DB に触れずに計算できるよう純粋関数にしている。
 * 週は日本時間の月曜始まり。
 */

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const JST = 9 * HOUR;

export type Count = { label: string; count: number };

export type InquiryStats = {
  total: number;
  unhandled: number;
  // 48 時間を過ぎても未対応のもの
  overdue: number;
  // 対応済みの割合（0〜1）。件数が無ければ null
  handledRate: number | null;
  // 受信から対応済みにするまでの中央値（時間）。対応済みが無ければ null
  medianResponseHours: number | null;
  // 直近 weeks 週の件数（古い順）。label は週の月曜日 "M/D"
  weekly: Count[];
  byCategory: Count[];
  bySource: Count[];
  byLanding: Count[];
};

// 日本時間での、その週の月曜 0:00 を UTC のミリ秒で返す
export function weekStart(ms: number): number {
  const local = ms + JST;
  const dow = new Date(local).getUTCDay(); // 0=日
  const sinceMonday = (dow + 6) % 7;
  const midnight = Math.floor(local / DAY) * DAY;
  return midnight - sinceMonday * DAY - JST;
}

function tally(values: (string | null)[], emptyLabel: string): Count[] {
  const map = new Map<string, number>();
  for (const v of values) {
    const key = v && v.trim() ? v : emptyLabel;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function summarizeInquiries(
  inquiries: Inquiry[],
  now: number = Date.now(),
  weeks = 12,
): InquiryStats {
  const handled = inquiries.filter((i) => i.isHandled);
  const unhandled = inquiries.length - handled.length;

  const responseHours = handled
    .filter((i) => i.handledAt)
    .map((i) => (Date.parse(i.handledAt!) - Date.parse(i.createdAt)) / HOUR)
    .filter((h) => h >= 0);

  const thisWeek = weekStart(now);
  const buckets = Array.from({ length: weeks }, (_, k) => thisWeek - (weeks - 1 - k) * 7 * DAY);
  const counts = new Map(buckets.map((b) => [b, 0]));
  for (const i of inquiries) {
    const b = weekStart(Date.parse(i.createdAt));
    if (counts.has(b)) counts.set(b, counts.get(b)! + 1);
  }

  return {
    total: inquiries.length,
    unhandled,
    overdue: inquiries.filter((i) => !i.isHandled && now - Date.parse(i.createdAt) > 2 * DAY)
      .length,
    handledRate: inquiries.length ? handled.length / inquiries.length : null,
    medianResponseHours: median(responseHours),
    weekly: buckets.map((b) => {
      const d = new Date(b + JST);
      return { label: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`, count: counts.get(b)! };
    }),
    byCategory: tally(inquiries.map((i) => i.category), "(未選択)"),
    bySource: tally(inquiries.map((i) => i.source), "直接・不明"),
    byLanding: tally(inquiries.map((i) => i.landingPath), "不明"),
  };
}

// CSV の1セル。ダブルクォートで囲み、中のダブルクォートは二重にする。
// 先頭が = + - @ のセルは、表計算ソフトで数式として実行されないよう ' を前置きする。
function cell(v: string | null): string {
  let s = v ?? "";
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function inquiriesToCsv(inquiries: Inquiry[]): string {
  const header = [
    "受信日時",
    "種別",
    "お名前",
    "メール",
    "電話",
    "内容",
    "流入元",
    "最初のページ",
    "対応",
    "対応日時",
  ];
  const rows = inquiries.map((i) => [
    i.createdAt,
    i.category,
    i.name,
    i.email,
    i.phone,
    i.message,
    i.source,
    i.landingPath,
    i.isHandled ? "対応済み" : "未対応",
    i.handledAt,
  ]);
  // BOM を付けないと Excel で日本語が文字化けする
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
