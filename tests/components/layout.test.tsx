import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../../src/App.tsx";
import { ErrorBoundary } from "../../src/components/layout/ErrorBoundary.tsx";

test("App renders skip link, landmarks, and manages section navigation", () => {
  render(<App />);

  // Skip to content link
  const skipLink = screen.getByRole("link", { name: /Skip to main content/i });
  assert.ok(skipLink);
  assert.equal(skipLink.getAttribute("href"), "#main-content");

  // Landmarks
  assert.ok(screen.getByRole("banner"));
  assert.ok(screen.getByRole("navigation", { name: /Plan sections/i }));
  assert.ok(screen.getByRole("main"));
  assert.ok(screen.getByRole("contentinfo"));

  // Navigation has Intake Wizard selected by default
  const wizardBtn = screen.getByRole("button", { name: "Intake Wizard" });
  assert.equal(wizardBtn.getAttribute("aria-current"), "page");

  // When no plan exists, other buttons are disabled
  const budgetBtn = screen.getByRole("button", { name: "Budget Planner" });
  assert.equal(budgetBtn.hasAttribute("disabled"), true);
});

test("ErrorBoundary catches runtime errors and displays accessible alert", () => {
  function ThrowingComponent(): React.JSX.Element {
    throw new Error("Simulated rendering failure");
  }

  render(
    <ErrorBoundary>
      <ThrowingComponent />
    </ErrorBoundary>,
  );

  const alert = screen.getByRole("alert");
  assert.ok(alert);
  assert.ok(screen.getByText(/Something went wrong/i));
  assert.ok(screen.getByText(/Simulated rendering failure/i));
  assert.ok(screen.getByRole("button", { name: /Try Again/i }));
});
