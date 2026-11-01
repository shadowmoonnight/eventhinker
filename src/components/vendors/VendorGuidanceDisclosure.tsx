import React from "react";

export interface VendorGuidanceDisclosureProps {
  category: string;
  questionsToAsk: readonly string[];
  redFlags: readonly string[];
}

export function VendorGuidanceDisclosure({
  category,
  questionsToAsk,
  redFlags,
}: VendorGuidanceDisclosureProps): React.JSX.Element {
  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
        Category Guidance: {category}
      </h4>
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold text-slate-800">Essential Questions to Ask:</p>
          <ul className="mt-1 list-disc pl-4 text-xs text-slate-700 space-y-1">
            {questionsToAsk.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold text-red-900">Watch for Red Flags:</p>
          <ul className="mt-1 list-disc pl-4 text-xs text-red-800 space-y-1">
            {redFlags.map((rf) => (
              <li key={rf}>{rf}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
