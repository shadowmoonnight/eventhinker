import React from "react";
import type { BudgetCategoryItem, BudgetStatus } from "../../../shared/types.ts";

export interface BudgetRowProps {
  category: BudgetCategoryItem;
  currency: string;
  onActualChange: (categoryId: string, actualMinor: number) => void;
}

function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(minor / 100);
}

function getProgressBarBg(status: BudgetStatus): string {
  if (status === "over") return "bg-red-700";
  if (status === "near") return "bg-amber-600";
  return "bg-emerald-700";
}

function renderStatusBadge(status: BudgetStatus, overAmount: number, currency: string): React.JSX.Element {
  if (status === "over") {
    return (
      <span className="inline-flex items-center gap-1 text-red-800">
        <span aria-hidden="true">✕</span>
        <span>Over by {formatMoney(overAmount, currency)}</span>
      </span>
    );
  }
  if (status === "near") {
    return (
      <span className="inline-flex items-center gap-1 text-amber-900">
        <span aria-hidden="true">⚠</span>
        <span>Near Budget (≥90%)</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-emerald-800">
      <span aria-hidden="true">✓</span>
      <span>On Track</span>
    </span>
  );
}

function BudgetActualInputCell({
  category,
  currency,
  onActualChange,
}: BudgetRowProps): React.JSX.Element {
  return (
    <td className="px-4 py-3.5 text-sm text-slate-800">
      <div className="flex items-center gap-1.5">
        <label htmlFor={`actual-${category.id}`} className="sr-only">
          Actual spend for {category.name} in {currency}
        </label>
        <input
          id={`actual-${category.id}`}
          type="number"
          min={0}
          step={10}
          value={category.actualMinor / 100}
          aria-label={`Actual spend for ${category.name}`}
          onChange={(e) => onActualChange(category.id, Math.round(parseFloat(e.target.value || "0") * 100))}
          className="block min-h-[44px] w-28 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 shadow-xs focus-visible:outline-2"
        />
      </div>
    </td>
  );
}

function BudgetProgressCell({
  category,
  currency,
}: {
  category: BudgetCategoryItem;
  currency: string;
}): React.JSX.Element {
  const diffPercent = category.plannedMinor > 0
    ? Math.round((category.actualMinor / category.plannedMinor) * 100)
    : 0;

  return (
    <td className="px-4 py-3.5 text-sm text-slate-800">
      <div className="w-28 sm:w-36">
        <div className="flex items-center justify-between text-xs text-slate-700">
          <span>{diffPercent}%</span>
          <span>{formatMoney(category.actualMinor, currency)}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={Math.min(100, diffPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Spend progress for ${category.name}`}
          className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className={`h-full transition-all ${getProgressBarBg(category.status)}`}
            style={{ width: `${Math.min(100, diffPercent)}%` }}
          />
        </div>
      </div>
    </td>
  );
}

/**
 * Memoized row component for a single budget category.
 */
export const BudgetRow = React.memo(function BudgetRow({
  category,
  currency,
  onActualChange,
}: BudgetRowProps): React.JSX.Element {
  const overAmount = Math.max(0, category.actualMinor - category.plannedMinor);

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
      <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
        <div className="flex items-center gap-2">
          <span>{category.name}</span>
          {category.isPriority ? (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-900">
              Priority (+25%)
            </span>
          ) : null}
        </div>
        <span className="text-xs font-normal text-slate-600">Template base: {category.templatePercent}%</span>
      </td>

      <td className="px-4 py-3.5 text-sm font-medium text-slate-800">
        {formatMoney(category.plannedMinor, currency)}
      </td>

      <BudgetActualInputCell category={category} currency={currency} onActualChange={onActualChange} />

      <BudgetProgressCell category={category} currency={currency} />

      <td className="px-4 py-3.5 text-xs font-semibold">
        {renderStatusBadge(category.status, overAmount, currency)}
      </td>
    </tr>
  );
});
