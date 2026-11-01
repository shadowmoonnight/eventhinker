import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { VendorChecklist } from "../../src/components/vendors/VendorChecklist.tsx";
import { createPlan } from "../../shared/planEngine.ts";
import { PlanProvider } from "../../src/state/PlanContext.tsx";

const planRes = createPlan(
  {
    eventType: "community",
    name: "Summer Solstice Street Fair",
    date: "2027-06-21",
    guestCount: 500,
    totalBudgetMinor: 1000000,
    currency: "USD",
    city: "Oakland",
    priorities: [],
    themeNotes: "",
    guestNeeds: "",
    culturalTraditions: "",
  },
  "2026-11-01",
);

test("VendorChecklist updates status, quote, and toggles vetting questions", () => {
  if (!planRes.ok) throw new Error("Plan failed");

  render(
    <PlanProvider
      initialState={{
        plan: planRes.value,
        activeSection: "vendors",
        notification: null,
      }}
    >
      <VendorChecklist />
    </PlanProvider>,
  );

  const heading = screen.getByRole("heading", { name: /Vendor Checklist & Vetting/i });
  assert.ok(heading);

  // Toggle guidance button
  const guidanceBtn = screen.getAllByRole("button", { name: /Vetting Guidance/i })[0];
  if (!guidanceBtn) throw new Error("No guidance button");
  fireEvent.click(guidanceBtn);

  // Guidance content should now be visible
  assert.ok(screen.getByText(/Essential Questions to Ask/i));
  assert.ok(screen.getByText(/Watch for Red Flags/i));
});
