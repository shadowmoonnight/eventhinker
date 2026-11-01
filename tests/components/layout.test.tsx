import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../../src/App.tsx";

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
