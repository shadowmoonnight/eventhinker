import assert from "node:assert/strict";
import test from "node:test";
import {
  validateDateString,
  validateIntakeData,
  validateVendorStatus,
} from "../../shared/validation.ts";

test("validateDateString checks format and real calendar constraints", () => {
  assert.equal(validateDateString("2026-06-15").ok, true);
  // Leap day in leap year
  assert.equal(validateDateString("2024-02-29").ok, true);
  // Non-leap day in non-leap year
  assert.equal(validateDateString("2025-02-29").ok, false);
  // Invalid formats and types
  assert.equal(validateDateString("").ok, false);
  assert.equal(validateDateString("invalid-date").ok, false);
  assert.equal(validateDateString("2026-13-01").ok, false);
  assert.equal(validateDateString("2026-04-31").ok, false);
  assert.equal(validateDateString(12345).ok, false);
  assert.equal(validateDateString(null).ok, false);
});

test("validateIntakeData validates and sanitizes complete and invalid payloads", () => {
  const valid = {
    eventType: "wedding",
    name: "Alex & Jordan Wedding",
    date: "2027-08-20",
    guestCount: 150,
    totalBudgetMinor: 2500000,
    currency: "USD",
    city: "Seattle",
    priorities: ["Venue", "Catering & Bar", "Photography & Video"],
    themeNotes: "Warm minimalist floral",
    guestNeeds: "3 vegan, 1 wheelchair access",
    culturalTraditions: "Tea ceremony",
  };

  const res = validateIntakeData(valid);
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.value.name, "Alex & Jordan Wedding");
    assert.equal(res.value.guestCount, 150);
    assert.equal(res.value.totalBudgetMinor, 2500000);
    assert.equal(res.value.priorities.length, 3);
  }

  // Invalid event type
  assert.equal(validateIntakeData({ ...valid, eventType: "festival" }).ok, false);
  // Missing name
  assert.equal(validateIntakeData({ ...valid, name: "" }).ok, false);
  // Guest count out of bounds
  assert.equal(validateIntakeData({ ...valid, guestCount: 0 }).ok, false);
  assert.equal(validateIntakeData({ ...valid, guestCount: 6000 }).ok, false);
  // Negative budget
  assert.equal(validateIntakeData({ ...valid, totalBudgetMinor: -100 }).ok, false);
  // Non-object
  assert.equal(validateIntakeData(null).ok, false);
  assert.equal(validateIntakeData("string").ok, false);
});

test("validateVendorStatus verifies allowed statuses", () => {
  assert.equal(validateVendorStatus("to-contact").ok, true);
  assert.equal(validateVendorStatus("contacted").ok, true);
  assert.equal(validateVendorStatus("quoted").ok, true);
  assert.equal(validateVendorStatus("booked").ok, true);
  assert.equal(validateVendorStatus("pending").ok, false);
  assert.equal(validateVendorStatus("").ok, false);
  assert.equal(validateVendorStatus(null).ok, false);
});
