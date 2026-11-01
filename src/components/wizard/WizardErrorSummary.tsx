import React from "react";

export interface WizardErrorSummaryProps {
  errors: Record<string, string>;
  summaryRef: React.RefObject<HTMLDivElement | null>;
}

export function WizardErrorSummary({
  errors,
  summaryRef,
}: WizardErrorSummaryProps): React.JSX.Element | null {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-title"
      className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 outline-none"
    >
      <h3 id="error-summary-title" className="text-sm font-bold text-red-900">
        Please resolve the following issues:
      </h3>
      <ul className="mt-2 list-disc pl-5 text-sm text-red-800">
        {entries.map(([field, msg]) => (
          <li key={field}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
