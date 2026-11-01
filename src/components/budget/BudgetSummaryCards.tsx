import React from "react";
import type { BudgetPlan } from "../../../shared/types.ts";

export interface BudgetSummaryCardsProps {
  budget: BudgetPlan;
  currency: string;
  guestCount: number;
}

function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(minor / 100);
}

/**
 * Summary card statistics for Budget Planner.
 */
export function BudgetSummaryCards({
  budget,
  currency,
  guestCount,
}: BudgetSummaryCardsProps): React.JSX.Element {
  const percentCommitted = budget.totalPlannedMinor > 0
    ? Math.round((budget.totalActualMinor / budget.totalPlannedMinor) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-xs">
        <p className="text-xs font-semibold text-slate-600">Total Planned</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{formatMoney(budget.totalPlannedMinor, currency)}</p>
      </div>
      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-xs">
        <p className="text-xs font-semibold text-slate-600">Actual Committed</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{formatMoney(budget.totalActualMinor, currency)}</p>
        <p className="text-[11px] text-slate-600">{percentCommitted}% of total</p>
      </div>
      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-xs">
        <p className="text-xs font-semibold text-slate-600">Remaining Variance</p>
        <p className={`mt-1 text-xl font-bold ${budget.remainingMinor < 0 ? "text-red-800" : "text-emerald-800"}`}>
          {formatMoney(budget.remainingMinor, currency)}
        </p>
      </div>
      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-xs">
        <p className="text-xs font-semibold text-slate-600">Cost Per Guest</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{formatMoney(budget.perGuestCostMinor, currency)}</p>
        <p className="text-[11px] text-slate-600">{guestCount} guests</p>
      </div>
    </div>
  );
}
