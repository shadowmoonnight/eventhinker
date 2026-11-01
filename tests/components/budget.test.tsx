import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetPlanner } from "../../src/components/budget/BudgetPlanner.tsx";
import { createPlan } from "../../shared/planEngine.ts";
import { PlanProvider } from "../../src/state/PlanContext.tsx";

const initialPlan = createPlan(
  {
    eventType: "wedding",
    name: "Mia & Ethan Wedding",
    date: "2027-09-12",
    guestCount: 100,
    totalBudgetMinor: 2000000,
    currency: "USD",
    city: "Chicago",
    priorities: ["Venue"],
    themeNotes: "",
    guestNeeds: "",
    culturalTraditions: "",
  },
  "2026-11-01",
);

test("BudgetPlanner displays table, updates actual spend, and renders over-budget alert", () => {
  if (!initialPlan.ok) throw new Error("Plan failed");

  render(
    <PlanProvider
      initialState={{
        plan: initialPlan.value,
        activeSection: "budget",
        notification: null,
      }}
    >
      <BudgetPlanner />
    </PlanProvider>,
  );

  const heading = screen.getByRole("heading", { name: /Budget Planner & Tracking/i });
  assert.ok(heading);

  // Find actual spend input for Venue
  const venueInput = screen.getByLabelText(/Actual spend for Venue/i);
  assert.ok(venueInput);

  // Increase actual spend beyond planned to trigger over-budget
  fireEvent.change(venueInput, { target: { value: "15000" } }); // $15,000 exceeds planned $5,600

  // Check that over-budget alert is rendered with text
  assert.ok(screen.getByText(/Over-Budget Warning/i));
  assert.ok(screen.getByText(/exceed their planned allocation/i));
});
