import assert from "node:assert/strict";
import test from "node:test";
import { createPlan } from "../../shared/planEngine.ts";
import type { EventPlan, IntakeData } from "../../shared/types.ts";
import {
  initialPlanState,
  planReducer,
  type PlanState,
} from "../../src/state/planReducer.ts";

const sampleIntake: IntakeData = {
  eventType: "birthday",
  name: "Leo 10th Birthday",
  date: "2027-04-12",
  guestCount: 30,
  totalBudgetMinor: 150000,
  currency: "USD",
  city: "San Diego",
  priorities: ["Venue", "Cake & Desserts"],
  themeNotes: "Space Explorer",
  guestNeeds: "1 peanut allergy",
  culturalTraditions: "",
};

const planRes = createPlan(sampleIntake, "2026-11-01");
if (!planRes.ok) throw new Error("Plan creation failed");
const samplePlan: EventPlan = planRes.value;

test("planReducer SET_PLAN initializes plan and switches section to budget", () => {
  const state: PlanState = { ...initialPlanState };
  const next = planReducer(state, { type: "SET_PLAN", payload: samplePlan });
  assert.equal(next.plan?.intake.name, "Leo 10th Birthday");
  assert.equal(next.activeSection, "budget");
  assert.ok(next.notification);
});

test("planReducer SET_SECTION updates active section", () => {
  const state: PlanState = { ...initialPlanState, plan: samplePlan };
  const next = planReducer(state, { type: "SET_SECTION", payload: "timeline" });
  assert.equal(next.activeSection, "timeline");
});

test("planReducer UPDATE_BUDGET_ACTUAL updates category spend and recomputes summary", () => {
  const state: PlanState = { ...initialPlanState, plan: samplePlan };
  const venueId = samplePlan.budget.categories[0]?.id ?? "venue";
  const next = planReducer(state, {
    type: "UPDATE_BUDGET_ACTUAL",
    payload: { categoryId: venueId, actualMinor: 50000 },
  });
  const updatedCategory = next.plan?.budget.categories.find((c) => c.id === venueId);
  assert.equal(updatedCategory?.actualMinor, 50000);
  assert.equal(next.plan?.budget.totalActualMinor, 50000);
});

test("planReducer TOGGLE_TASK toggles milestone completion", () => {
  const state: PlanState = { ...initialPlanState, plan: samplePlan };
  const taskId = samplePlan.timeline.tasks[0]?.id ?? "";
  const next = planReducer(state, {
    type: "TOGGLE_TASK",
    payload: { taskId, today: "2026-11-01" },
  });
  const task = next.plan?.timeline.tasks.find((t) => t.id === taskId);
  assert.equal(task?.completed, true);
});

test("planReducer UPDATE_VENDOR updates vendor status, quote, and notes", () => {
  const state: PlanState = { ...initialPlanState, plan: samplePlan };
  const vendorId = samplePlan.vendors[0]?.id ?? "";
  const next = planReducer(state, {
    type: "UPDATE_VENDOR",
    payload: {
      vendorId,
      patch: { status: "booked", quoteMinor: 40000, notes: "Deposit paid" },
    },
  });
  const vendor = next.plan?.vendors.find((v) => v.id === vendorId);
  assert.equal(vendor?.status, "booked");
  assert.equal(vendor?.quoteMinor, 40000);
  assert.equal(vendor?.notes, "Deposit paid");
});

test("planReducer UPDATE_INTAKE replans while preserving progress", () => {
  const state: PlanState = { ...initialPlanState, plan: samplePlan };
  const next = planReducer(state, {
    type: "UPDATE_INTAKE",
    payload: { patch: { guestCount: 45 }, today: "2026-11-01" },
  });
  assert.equal(next.plan?.intake.guestCount, 45);
});

test("planReducer RESET_PLAN returns initial state", () => {
  const state: PlanState = { ...initialPlanState, plan: samplePlan, activeSection: "ideas" };
  const next = planReducer(state, { type: "RESET_PLAN" });
  assert.equal(next.plan, null);
  assert.equal(next.activeSection, "wizard");
});

test("planReducer returns unchanged state on unknown action", () => {
  const state: PlanState = { ...initialPlanState, plan: samplePlan };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const next = planReducer(state, { type: "UNKNOWN_ACTION" as any });
  assert.equal(next, state);
});
