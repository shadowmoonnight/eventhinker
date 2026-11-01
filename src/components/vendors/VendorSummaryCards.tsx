import React from "react";
import { CARD_PANEL_CLASS } from "../ui/styles.ts";

export interface VendorSummaryCardsProps {
  totalCount: number;
  bookedCount: number;
  totalBookedMinor: number;
  totalQuotedMinor: number;
  currency: string;
}

function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(minor / 100);
}

/**
 * Summary card metrics for Vendor Checklist.
 */
export function VendorSummaryCards({
  totalCount,
  bookedCount,
  totalBookedMinor,
  totalQuotedMinor,
  currency,
}: VendorSummaryCardsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className={CARD_PANEL_CLASS}>
        <p className="text-xs font-semibold text-slate-600">Total Categories</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{totalCount}</p>
      </div>
      <div className={CARD_PANEL_CLASS}>
        <p className="text-xs font-semibold text-slate-600">Booked Contracts</p>
        <p className="mt-1 text-xl font-bold text-emerald-800">
          {bookedCount} / {totalCount}
        </p>
      </div>
      <div className={CARD_PANEL_CLASS}>
        <p className="text-xs font-semibold text-slate-600">Committed Quotes</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{formatMoney(totalBookedMinor, currency)}</p>
      </div>
      <div className={CARD_PANEL_CLASS}>
        <p className="text-xs font-semibold text-slate-600">Pending Quotes</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{formatMoney(totalQuotedMinor, currency)}</p>
      </div>
    </div>
  );
}
