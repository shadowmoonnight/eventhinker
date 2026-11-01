import React, { useCallback, useMemo } from "react";
import { usePlanDispatch, usePlanState } from "../../state/PlanContext.tsx";
import { CARD_EMPTY_CLASS, SECTION_HEADING_2XL, SECTION_HEADING_XL } from "../ui/styles.ts";
import { BudgetSummaryCards } from "./BudgetSummaryCards.tsx";
import { BudgetTable } from "./BudgetTable.tsx";

function BudgetWarning({ overCount }: { overCount: number }): React.JSX.Element {
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-xl text-red-700 font-bold">⚠</span>
        <div>
          <h3 className="text-sm font-bold text-red-900">Over-Budget Warning</h3>
          <p className="mt-0.5 text-xs text-red-800">
            {overCount} category/categories exceed their planned allocation. Review vendor quotes and contingency reserves.
          </p>
        </div>
      </div>
    </div>
  );
}

function BudgetEmptyState(): React.JSX.Element {
  return (
    <div className={CARD_EMPTY_CLASS}>
      <h2 id="section-heading-budget" tabIndex={-1} className={SECTION_HEADING_XL}>
        No Plan Active
      </h2>
      <p className="mt-2 text-sm text-slate-700">Please complete the Intake Wizard first to generate your budget.</p>
    </div>
  );
}

/**
 * Budget Planner view with interactive actual spend inputs, progress bars, and warnings.
 */
export function BudgetPlanner(): React.JSX.Element {
  const { plan } = usePlanState();
  const dispatch = usePlanDispatch();

  const handleActualChange = useCallback(
    (categoryId: string, actualMinor: number): void => {
      dispatch({ type: "UPDATE_BUDGET_ACTUAL", payload: { categoryId, actualMinor } });
    },
    [dispatch],
  );

  const budget = plan?.budget;
  const currency = plan?.intake.currency ?? "USD";

  const overCount = useMemo(() => {
    return budget?.categories.filter((c) => c.status === "over").length ?? 0;
  }, [budget]);

  if (!plan || !budget) {
    return <BudgetEmptyState />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 id="section-heading-budget" tabIndex={-1} className={SECTION_HEADING_2XL}>
          Budget Planner & Tracking
        </h2>
        <p className="text-sm text-slate-700">
          Calculated allocations based on your {plan.intake.eventType} priorities. Cost figures are guidelines and estimates, not quotes.
        </p>
      </div>

      {budget.hasOverBudget ? <BudgetWarning overCount={overCount} /> : null}

      <BudgetSummaryCards budget={budget} currency={currency} guestCount={plan.intake.guestCount} />

      <BudgetTable categories={budget.categories} currency={currency} onActualChange={handleActualChange} />
    </div>
  );
}
