import React from "react";
import type { VendorStatus } from "../../../shared/types.ts";

const STATUS_LABELS: Record<VendorStatus, string> = {
  "to-contact": "To Contact",
  contacted: "Contacted",
  quoted: "Quoted",
  booked: "Booked",
};

export interface VendorRowControlsProps {
  id: string;
  name: string;
  status: VendorStatus;
  quoteMinor: number;
  currency: string;
  showGuidance: boolean;
  guidanceLoading: boolean;
  onStatusChange: (status: VendorStatus) => void;
  onQuoteChange: (quoteMinor: number) => void;
  onToggleGuidance: () => void;
}

function getGuidanceButtonLabel(loading: boolean, expanded: boolean): string {
  if (loading) return "Loading...";
  if (expanded) return "Hide Vetting Advice";
  return "Vetting Guidance";
}

export function VendorRowControls({
  id,
  name,
  status,
  quoteMinor,
  currency,
  showGuidance,
  guidanceLoading,
  onStatusChange,
  onQuoteChange,
  onToggleGuidance,
}: VendorRowControlsProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div>
        <label htmlFor={`status-${id}`} className="sr-only">Status for {name}</label>
        <select
          id={`status-${id}`}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as VendorStatus)}
          className="min-h-[44px] rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs focus-visible:outline-2"
        >
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`quote-${id}`} className="sr-only">Quote or estimate for {name} in {currency}</label>
        <div className="relative flex items-center">
          <span className="absolute left-2.5 text-xs text-slate-500 font-medium">$</span>
          <input
            id={`quote-${id}`}
            type="number"
            min={0}
            step={50}
            placeholder="Quote amount"
            value={quoteMinor ? quoteMinor / 100 : ""}
            onChange={(e) => onQuoteChange(Math.round(parseFloat(e.target.value || "0") * 100))}
            className="min-h-[44px] w-28 rounded-md border border-slate-300 pl-6 pr-2 py-1.5 text-xs font-medium text-slate-900 shadow-xs focus-visible:outline-2"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleGuidance}
        aria-expanded={showGuidance}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-blue-800 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-100 focus-visible:outline-2"
      >
        {getGuidanceButtonLabel(guidanceLoading, showGuidance)}
      </button>
    </div>
  );
}
