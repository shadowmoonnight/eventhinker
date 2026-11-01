import React from "react";

export interface SummaryDisplayProps {
  text: string;
  isStreaming: boolean;
  eventName: string;
}

/**
 * Display container for Executive Plan Summary with print headers.
 */
export function SummaryDisplay({
  text,
  isStreaming,
  eventName,
}: SummaryDisplayProps): React.JSX.Element {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-busy={isStreaming}
      className="card-print min-h-[350px] rounded-xl border border-slate-300 bg-white p-6 shadow-xs font-sans text-sm leading-relaxed text-slate-900 whitespace-pre-wrap sm:p-8"
    >
      {text ? (
        <div>
          <div className="mb-4 hidden border-b border-slate-300 pb-2 print-only">
            <h1 className="text-xl font-bold">{eventName} — Event Plan Summary</h1>
            <p className="text-xs text-slate-600">Printed on {new Date().toLocaleDateString()}</p>
          </div>
          {text}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center text-center text-slate-600 no-print">
          <span aria-hidden="true" className="text-4xl">📄</span>
          <p className="mt-3 font-semibold text-slate-900">Generate a concise executive summary</p>
          <p className="mt-1 text-xs">
            Includes event vision, financial health, milestone deadlines, and vendor logistics.
          </p>
        </div>
      )}
    </div>
  );
}
