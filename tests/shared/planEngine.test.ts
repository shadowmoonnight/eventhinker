import assert from "node:assert/strict";
import test from "node:test";
import { createPlan, replan } from "../../shared/planEngine.ts";
import type { IntakeData } from "../../shared/types.ts";

const sampleIntake: IntakeData = {
  eventType: "wedding",
  name: "Morgan & Taylor Celebration",
  date: "2027-09-18",
  guestCount: 120,
  totalBudgetMinor: 3000000, // $30,000
  currency: "USD",
  city: "Denver",
  priorities: ["Venue", "Catering & Bar"],
  themeNotes: "Mountain rustic elegance",
  guestNeeds: "Wheelchair ramp needed",
  culturalTraditions: "",
};

test("createPlan creates a complete plan with budget, timeline, and vendors", () => {
  const res = createPlan(sampleIntake, "2026-11-01");
  assert.equal(res.ok, true);
  if (res.ok) {
    const plan = res.value;
    assert.equal(plan.intake.name, "Morgan & Taylor Celebration");
    assert.equal(plan.budget.totalPlannedMinor, 3000000);
    assert.ok(plan.budget.categories.length > 5);
    assert.ok(plan.timeline.tasks.length >= 10);
    assert.ok(plan.vendors.length >= 3);
    assert.equal(plan.lastUpdated, "2026-11-01");
  }
});

test("replan preserves user progress (completed tasks, actual spend, vendor notes) by id", () => {
  const initialRes = createPlan(sampleIntake, "2026-11-01");
  assert.equal(initialRes.ok, true);
  if (!initialRes.ok) return;

  const initialPlan = initialRes.value;

  // Simulate user modifications:
  // 1. Mark first task as completed
  const firstTaskId = initialPlan.timeline.tasks[0]?.id ?? "";
  initialPlan.timeline.tasks = initialPlan.timeline.tasks.map((t) =>
    t.id === firstTaskId ? { ...t, completed: true } : t,
  );

  // 2. Set actual spend on venue
  initialPlan.budget.categories = initialPlan.budget.categories.map((c) =>
    c.id === "venue" ? { ...c, actualMinor: 950000 } : c,
  );

  // 3. Update vendor quote and notes
  const firstVendorId = initialPlan.vendors[0]?.id ?? "";
  initialPlan.vendors = initialPlan.vendors.map((v) =>
    v.id === firstVendorId
      ? { ...v, status: "quoted", quoteMinor: 900000, notes: "Special rate offered" }
      : v,
  );

  // Re-plan with an increased budget and updated guest count
  const replanRes = replan(
    initialPlan,
    { totalBudgetMinor: 3500000, guestCount: 140 },
    "2026-11-01",
  );

  assert.equal(replanRes.ok, true);
  if (replanRes.ok) {
    const updated = replanRes.value;
    // Check that planned budget recomputed to 3,500,000
    assert.equal(updated.budget.totalPlannedMinor, 3500000);
    // Check that actual spend on venue was preserved!
    const venue = updated.budget.categories.find((c) => c.id === "venue");
    assert.equal(venue?.actualMinor, 950000);

    // Check that completed task was preserved!
    const task = updated.timeline.tasks.find((t) => t.id === firstTaskId);
    assert.equal(task?.completed, true);

    // Check that vendor status and notes were preserved!
    const vendor = updated.vendors.find((v) => v.id === firstVendorId);
    assert.equal(vendor?.status, "quoted");
    assert.equal(vendor?.quoteMinor, 900000);
    assert.equal(vendor?.notes, "Special rate offered");
  }
});
