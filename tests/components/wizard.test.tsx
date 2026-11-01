import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { IntakeWizard } from "../../src/components/wizard/IntakeWizard.tsx";
import { PlanProvider } from "../../src/state/PlanContext.tsx";

test("IntakeWizard renders form with stepper and validates required fields with error summary", () => {
  const { container } = render(
    <PlanProvider>
      <IntakeWizard />
    </PlanProvider>,
  );

  // Checks step 1 heading
  const heading = screen.getByRole("heading", { name: /Event Essentials/i });
  assert.ok(heading);

  // Click continue without entering name or date
  const continueBtn = screen.getByRole("button", { name: /Continue to Step 2/i });
  fireEvent.click(continueBtn);

  // Error alert summary should be displayed
  const errorAlert = screen.getByRole("alert");
  assert.ok(errorAlert);
  assert.ok(screen.getAllByText(/Event name is required/i).length >= 1);

  // Enter valid name and future date
  const nameInput = container.querySelector("#field-name") as HTMLInputElement;
  fireEvent.change(nameInput, { target: { value: "Golden Jubilee Anniversary" } });

  const dateInput = container.querySelector("#field-date") as HTMLInputElement;
  fireEvent.change(dateInput, { target: { value: "2027-10-15" } });

  const nextBtn = screen.getByRole("button", { name: /Continue to Step 2/i });
  fireEvent.click(nextBtn);

  // Should successfully advance to Step 2
  assert.ok(screen.getByRole("heading", { name: /Headcount & Budget/i }));
});
