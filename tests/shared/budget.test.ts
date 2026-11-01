import assert from "node:assert/strict";
import test from "node:test";
import {
  allocateBudget,
  computeBudgetStatus,
  computeBudgetSummary,
} from "../../shared/budget.ts";
import type { EventType } from "../../shared/types.ts";

test("allocateBudget property loop: allocations sum exactly to totalMinor across diverse totals and event types", () => {
  const eventTypes: EventType[] = ["wedding", "birthday", "community"];
  const testTotals = [
    0,
    1,
    7,
    100,
    999,
    12345,
    500000,
    100000000,
    1000000000, // 10 million major = 1 billion minor
  ];

  for (const type of eventTypes) {
    for (const total of testTotals) {
      const items = allocateBudget(total, type, []);
      const sum = items.reduce((s, it) => s + it.plannedMinor, 0);
      assert.equal(sum, total, `Sum mismatch for ${type} at total ${total}`);
      for (const it of items) {
        assert.ok(it.plannedMinor >= 0, `Negative allocation for ${it.name}`);
        assert.equal(Number.isInteger(it.plannedMinor), true);
      }
    }
  }
});

test("allocateBudget priority boost increases allocation and preserves contingency floor", () => {
  const total = 1000000; // $10,000.00
  const baseItems = allocateBudget(total, "wedding", []);
  const boostedItems = allocateBudget(total, "wedding", ["Venue", "Photography & Video"]);

  const baseVenue = baseItems.find((c) => c.id === "venue")?.plannedMinor ?? 0;
  const boostedVenue = boostedItems.find((c) => c.id === "venue")?.plannedMinor ?? 0;
  assert.ok(boostedVenue > baseVenue, "Priority category did not receive boost");

  const baseCont = baseItems.find((c) => c.id === "contingency")?.plannedMinor ?? 0;
  const boostedCont = boostedItems.find((c) => c.id === "contingency")?.plannedMinor ?? 0;
  // Contingency floor: never reduced below template share (5% of 1000000 = 50000)
  assert.ok(boostedCont >= 50000, `Contingency fell below floor: ${boostedCont} < 50000`);
  assert.ok(boostedCont >= baseCont - 1, "Contingency reduced significantly below base share");

  const sum = boostedItems.reduce((s, it) => s + it.plannedMinor, 0);
  assert.equal(sum, total);
});

test("allocateBudget tie breaking is deterministic", () => {
  const res1 = allocateBudget(103, "wedding", []);
  const res2 = allocateBudget(103, "wedding", []);
  assert.deepEqual(res1, res2);
});

test("computeBudgetStatus categorizes under, near, and over", () => {
  assert.equal(computeBudgetStatus(1000, 500), "under");
  assert.equal(computeBudgetStatus(1000, 900), "near");
  assert.equal(computeBudgetStatus(1000, 950), "near");
  assert.equal(computeBudgetStatus(1000, 1000), "near");
  assert.equal(computeBudgetStatus(1000, 1001), "over");
  assert.equal(computeBudgetStatus(1000, 2000), "over");
  assert.equal(computeBudgetStatus(0, 0), "under");
  assert.equal(computeBudgetStatus(0, 50), "over");
});

test("computeBudgetSummary aggregates totals and per-guest cost accurately", () => {
  const items = allocateBudget(500000, "birthday", []);
  const summary = computeBudgetSummary(items, "USD", 25);

  assert.equal(summary.totalPlannedMinor, 500000);
  assert.equal(summary.totalActualMinor, 0);
  assert.equal(summary.remainingMinor, 500000);
  assert.equal(summary.perGuestCostMinor, 20000); // 500000 / 25
  assert.equal(summary.hasOverBudget, false);
});
