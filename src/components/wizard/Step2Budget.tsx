import React from "react";

export interface Step2Props {
  guestCount: number;
  setGuestCount: (g: number) => void;
  budgetMajor: number;
  setBudgetMajor: (b: number) => void;
  currency: string;
  setCurrency: (c: string) => void;
  errors: Record<string, string>;
}

function BudgetCurrencyFields({
  budgetMajor,
  setBudgetMajor,
  currency,
  setCurrency,
  budgetError,
}: {
  budgetMajor: number;
  setBudgetMajor: (b: number) => void;
  currency: string;
  setCurrency: (c: string) => void;
  budgetError?: string;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="field-budget" className="block text-sm font-bold text-slate-900">
          Total Budget ({currency}) <span className="text-red-700">*</span>
        </label>
        <input
          id="field-budget"
          type="number"
          min={0}
          step={100}
          value={budgetMajor}
          onChange={(e) => setBudgetMajor(parseFloat(e.target.value || "0"))}
          aria-invalid={Boolean(budgetError)}
          aria-describedby={budgetError ? "budget-error" : undefined}
          className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-2"
        />
        {budgetError ? (
          <p id="budget-error" className="mt-1 text-xs font-semibold text-red-700">{budgetError}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="field-currency" className="block text-sm font-bold text-slate-900">
          Currency Code
        </label>
        <select
          id="field-currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-2"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="CAD">CAD ($)</option>
          <option value="AUD">AUD ($)</option>
        </select>
      </div>
    </div>
  );
}

/**
 * Step 2: Headcount, total budget, and currency inputs.
 */
export function Step2Budget({
  guestCount,
  setGuestCount,
  budgetMajor,
  setBudgetMajor,
  currency,
  setCurrency,
  errors,
}: Step2Props): React.JSX.Element {
  return (
    <div className="mt-4 space-y-5">
      <div>
        <label htmlFor="field-guests" className="block text-sm font-bold text-slate-900">
          Estimated Guest Count <span className="text-red-700">*</span>
        </label>
        <input
          id="field-guests"
          type="number"
          min={1}
          max={5000}
          value={guestCount}
          onChange={(e) => setGuestCount(parseInt(e.target.value || "0", 10))}
          aria-invalid={Boolean(errors["guestCount"])}
          aria-describedby={errors["guestCount"] ? "guest-error" : undefined}
          className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-2"
        />
        {errors["guestCount"] ? (
          <p id="guest-error" className="mt-1 text-xs font-semibold text-red-700">{errors["guestCount"]}</p>
        ) : null}
      </div>

      <BudgetCurrencyFields
        budgetMajor={budgetMajor}
        setBudgetMajor={setBudgetMajor}
        currency={currency}
        setCurrency={setCurrency}
        budgetError={errors["budget"]}
      />
    </div>
  );
}
