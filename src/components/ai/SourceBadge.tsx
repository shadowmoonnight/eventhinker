import React from "react";

export interface SourceBadgeProps {
  source: "ai" | "fallback";
  label?: string;
}

/**
 * Accessible source attribution badge.
 * Strictly communicates whether content was AI-generated or template-derived.
 */
export function SourceBadge({ source, label }: SourceBadgeProps): React.JSX.Element {
  const isAi = source === "ai";
  const displayLabel = label || (isAi ? "AI-generated" : "Template-based (AI unavailable)");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        isAi
          ? "border border-blue-300 bg-blue-50 text-blue-900"
          : "border border-amber-300 bg-amber-50 text-amber-900"
      }`}
    >
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
      <span>{displayLabel}</span>
    </span>
  );
}
