import React, { useState } from "react";
import type { VendorItem, VendorStatus } from "../../../shared/types.ts";
import type { VendorItemPatch } from "../../../shared/vendors.ts";
import { VendorGuidanceDisclosure } from "./VendorGuidanceDisclosure.tsx";
import { VendorRowControls } from "./VendorRowControls.tsx";

export interface VendorRowProps {
  vendor: VendorItem;
  currency: string;
  onUpdate: (
    vendorId: string,
    patch: VendorItemPatch,
  ) => void;
  onLoadGuidance: (category: string) => void;
  guidanceLoading?: boolean;
}

function VendorRowNotes({
  id,
  notes,
  onUpdate,
}: {
  id: string;
  notes: string;
  onUpdate: (id: string, patch: VendorItemPatch) => void;
}): React.JSX.Element {
  return (
    <div className="mt-3">
      <label htmlFor={`notes-${id}`} className="block text-xs font-semibold text-slate-700">
        Notes & Evaluation Details
      </label>
      <input
        id={`notes-${id}`}
        type="text"
        value={notes}
        onChange={(e) => onUpdate(id, { notes: e.target.value })}
        placeholder="e.g., Contact person, packages evaluated, special clauses"
        className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 shadow-xs focus-visible:outline-2"
      />
    </div>
  );
}

/**
 * Memoized row for an individual vendor category with inline vetting guidance disclosure.
 */
export const VendorRow = React.memo(function VendorRow({
  vendor,
  currency,
  onUpdate,
  onLoadGuidance,
  guidanceLoading = false,
}: VendorRowProps): React.JSX.Element {
  const [showGuidance, setShowGuidance] = useState<boolean>(false);

  const toggleGuidance = (): void => {
    if (!showGuidance && vendor.questionsToAsk.length === 0) {
      onLoadGuidance(vendor.category);
    }
    setShowGuidance((prev) => !prev);
  };

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-xs transition-colors hover:border-slate-400">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">{vendor.name}</h3>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {vendor.category}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-600">
            {vendor.status === "booked" ? "Contract secured" : "Vetting in progress"}
          </p>
        </div>

        <VendorRowControls
          id={vendor.id}
          name={vendor.name}
          status={vendor.status}
          quoteMinor={vendor.quoteMinor}
          currency={currency}
          showGuidance={showGuidance}
          guidanceLoading={guidanceLoading}
          onStatusChange={(status: VendorStatus) => onUpdate(vendor.id, { status })}
          onQuoteChange={(quoteMinor: number) => onUpdate(vendor.id, { quoteMinor })}
          onToggleGuidance={toggleGuidance}
        />
      </div>

      <VendorRowNotes id={vendor.id} notes={vendor.notes} onUpdate={onUpdate} />

      {showGuidance ? (
        <VendorGuidanceDisclosure
          category={vendor.category}
          questionsToAsk={vendor.questionsToAsk}
          redFlags={vendor.redFlags}
        />
      ) : null}
    </div>
  );
});
