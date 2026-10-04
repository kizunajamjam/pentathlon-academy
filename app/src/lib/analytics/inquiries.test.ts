import assert from "node:assert/strict";
import { test } from "node:test";

import { inquiriesToCsv, summarizeInquiries, weekStart } from "./inquiries.ts";
import type { Inquiry } from "../../types/index.ts";

function make(over: Partial<Inquiry>): Inquiry {
  return {
    id: "x",
    name: "山田",
    email: "a@example.com",
    phone: null,
    category: "入会について",
    message: "こんにちは",
    isHandled: false,
    createdAt: "2026-10-05T01:00:00Z",
    source: null,
    landingPath: null,
    handledAt: null,
    ...over,
  };
}

test("週は日本時間の月曜始まり", () => {
  // 2026-10-04(日) 23:00 JST は、その前の月曜(9/28)の週
  const sunday = Date.parse("2026-10-04T14:00:00Z");
  assert.equal(new Date(weekStart(sunday) + 9 * 3600_000).toISOString(), "2026-09-28T00:00:00.000Z");
  // 2026-10-05(月) 0:30 JST は新しい週
  const monday = Date.parse("2026-10-04T15:30:00Z");
  assert.equal(new Date(weekStart(monday) + 9 * 3600_000).toISOString(), "2026-10-05T00:00:00.000Z");
});

test("件数・対応率・対応時間の中央値・流入元を集計する", () => {
  const now = Date.parse("2026-10-06T00:00:00Z");
  const list = [
    make({ source: "instagram.com", isHandled: true, handledAt: "2026-10-05T03:00:00Z" }), // 2h
    make({ source: "instagram.com", isHandled: true, handledAt: "2026-10-05T07:00:00Z" }), // 6h
    make({ source: null, createdAt: "2026-09-01T00:00:00Z" }), // 48h超の未対応
  ];
  const s = summarizeInquiries(list, now);

  assert.equal(s.total, 3);
  assert.equal(s.unhandled, 1);
  assert.equal(s.overdue, 1);
  assert.equal(s.handledRate, 2 / 3);
  assert.equal(s.medianResponseHours, 4);
  assert.deepEqual(s.bySource, [
    { label: "instagram.com", count: 2 },
    { label: "直接・不明", count: 1 },
  ]);
  assert.equal(s.weekly.length, 12);
  assert.equal(s.weekly[11].count, 2);
});

test("問い合わせが無いときは割合と中央値を null にする", () => {
  const s = summarizeInquiries([]);
  assert.equal(s.handledRate, null);
  assert.equal(s.medianResponseHours, null);
});

test("CSV はクォートを二重化し、数式として解釈される先頭文字を無害化する", () => {
  const csv = inquiriesToCsv([make({ name: '=HYPERLINK("x")', message: 'a"b\nc' })]);
  assert.ok(csv.startsWith("﻿"));
  assert.ok(csv.includes(`"'=HYPERLINK(""x"")"`));
  assert.ok(csv.includes(`"a""b\nc"`));
});
