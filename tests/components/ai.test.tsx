import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { render, screen } from "@testing-library/react";
import { SourceBadge } from "../../src/components/ai/SourceBadge.tsx";

test("SourceBadge correctly reflects AI-generated and template-based sources", () => {
  const { rerender } = render(<SourceBadge source="ai" label="AI-generated" />);
  assert.ok(screen.getByText("AI-generated"));

  rerender(<SourceBadge source="fallback" label="Template-based (AI unavailable)" />);
  assert.ok(screen.getByText("Template-based (AI unavailable)"));
});
