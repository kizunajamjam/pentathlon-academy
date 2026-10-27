import assert from "node:assert/strict";
import { test } from "node:test";

import { fromDatetimeLocal } from "./date.ts";

test("datetime-local の値を JST として ISO に直す", () => {
  assert.equal(fromDatetimeLocal("2026-08-20T10:00"), "2026-08-20T01:00:00.000Z");
  // 秒つきで来ることもある
  assert.equal(fromDatetimeLocal("2026-08-20T10:00:30"), "2026-08-20T01:00:30.000Z");
});

test("形の違う値は例外にせず null を返す", () => {
  assert.equal(fromDatetimeLocal(""), null);
  assert.equal(fromDatetimeLocal("あした"), null);
  assert.equal(fromDatetimeLocal("2026-13-40T10:00"), null);
});
