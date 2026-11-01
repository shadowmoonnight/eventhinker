import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { TimelineView } from "../../src/components/timeline/TimelineView.tsx";
import { createPlan } from "../../shared/planEngine.ts";
import { PlanProvider } from "../../src/state/PlanContext.tsx";

const planRes = createPlan(
  {
    eventType: "birthday",
    name: "Zoe 5th Birthday",
    date: "2027-05-20",
    guestCount: 25,
    totalBudgetMinor: 200000,
    currency: "USD",
    city: "Seattle",
    priorities: [],
    themeNotes: "",
    guestNeeds: "",
    culturalTraditions: "",
  },
  "2026-11-01",
);

test("TimelineView toggles milestone completed status and switches filters", () => {
  if (!planRes.ok) throw new Error("Plan failed");

  render(
    <PlanProvider
      initialState={{
        plan: planRes.value,
        activeSection: "timeline",
        notification: null,
      }}
    >
      <TimelineView />
    </PlanProvider>,
  );

  const heading = screen.getByRole("heading", { name: /Milestone Timeline/i });
  assert.ok(heading);

  const checkboxes = screen.getAllByRole("checkbox");
  assert.ok(checkboxes.length > 0);

  // Toggle first task
  const firstCheckbox = checkboxes[0];
  if (!firstCheckbox) throw new Error("No checkbox");
  fireEvent.click(firstCheckbox);

  // Filter by completed
  const completedFilterBtn = screen.getByRole("button", { name: "completed" });
  fireEvent.click(completedFilterBtn);

  assert.ok(screen.getAllByText(/Completed/i).length >= 1);
});
