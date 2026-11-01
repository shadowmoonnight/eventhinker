import assert from "node:assert/strict";
import test from "node:test";
import { createPlan } from "../../shared/planEngine.ts";
import type { EventPlan, IntakeData } from "../../shared/types.ts";
import {
  clearSavedPlan,
  loadSavedPlan,
  savePlan,
  STORAGE_KEY,
} from "../../src/state/storage.ts";

const sampleIntake: IntakeData = {
  eventType: "wedding",
  name: "Taylor & Jordan",
  date: "2027-06-20",
  guestCount: 80,
  totalBudgetMinor: 2000000,
  currency: "USD",
  city: "Portland",
  priorities: ["Venue"],
  themeNotes: "",
  guestNeeds: "",
  culturalTraditions: "",
};

const planRes = createPlan(sampleIntake, "2026-11-01");
if (!planRes.ok) throw new Error("Plan creation failed");
const validPlan: EventPlan = planRes.value;

test("storage saves, loads, and clears valid plan", () => {
  assert.equal(savePlan(validPlan), true);
  const loaded = loadSavedPlan();
  assert.equal(loaded?.intake.name, "Taylor & Jordan");
  clearSavedPlan();
  assert.equal(loadSavedPlan(), null);
});

test("storage handles corrupted JSON gracefully", () => {
  globalThis.localStorage.setItem(STORAGE_KEY, "this-is-not-valid-json{{{");
  const loaded = loadSavedPlan();
  assert.equal(loaded, null);
  clearSavedPlan();
});

test("storage handles wrong schema and invalid structures", () => {
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: "bar" }));
  assert.equal(loadSavedPlan(), null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assert.equal(savePlan({} as any), false);
  clearSavedPlan();
});

test("storage handles storage throwing exceptions gracefully", () => {
  const originalGet = globalThis.localStorage.getItem;
  globalThis.localStorage.getItem = () => {
    throw new Error("Quota exceeded / disabled");
  };
  assert.equal(loadSavedPlan(), null);
  globalThis.localStorage.getItem = originalGet;
});
