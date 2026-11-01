import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTimeline,
  formatUtcDate,
  isTaskOverdue,
  parseUtcMidnight,
} from "../../shared/timeline.ts";

test("parseUtcMidnight and formatUtcDate handle leap day and roundtrips without DST shift", () => {
  const leapDay = "2024-02-29";
  const ms = parseUtcMidnight(leapDay);
  assert.equal(formatUtcDate(ms), leapDay);

  const dstDate = "2026-11-01";
  const dstMs = parseUtcMidnight(dstDate);
  assert.equal(formatUtcDate(dstMs), dstDate);
});

test("buildTimeline rejects past date with validation error", () => {
  const res = buildTimeline("2026-01-01", "2026-06-01", "wedding");
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.match(res.error, /past/i);
  }
});

test("buildTimeline handles normal lead time without compression", () => {
  const res = buildTimeline("2027-10-01", "2026-10-01", "wedding");
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.value.isCompressed, false);
    assert.equal(res.value.compressionWarning, undefined);
    assert.ok(res.value.tasks.length >= 10);
  }
});

test("buildTimeline handles compressed lead time and scales offsets", () => {
  // 30 days lead time for wedding where max offset is 360 days
  const res = buildTimeline("2026-07-01", "2026-06-01", "wedding");
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.value.isCompressed, true);
    assert.ok(res.value.compressionWarning?.includes("Compressed timeline"));
    // Every task must be scheduled between today and eventDate
    for (const task of res.value.tasks) {
      assert.ok(task.dueDate >= "2026-06-01" && task.dueDate <= "2026-07-01");
      assert.ok(task.daysBefore >= 1);
    }
  }
});

test("buildTimeline handles same-day event cleanly", () => {
  const res = buildTimeline("2026-06-01", "2026-06-01", "birthday");
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.value.isCompressed, true);
    for (const task of res.value.tasks) {
      assert.equal(task.dueDate, "2026-06-01");
      assert.equal(task.daysBefore, 0);
    }
  }
});

test("isTaskOverdue respects completion status and reference date", () => {
  assert.equal(
    isTaskOverdue({ completed: false, dueDate: "2026-05-01" }, "2026-06-01"),
    true,
  );
  assert.equal(
    isTaskOverdue({ completed: true, dueDate: "2026-05-01" }, "2026-06-01"),
    false,
  );
  assert.equal(
    isTaskOverdue({ completed: false, dueDate: "2026-07-01" }, "2026-06-01"),
    false,
  );
});
