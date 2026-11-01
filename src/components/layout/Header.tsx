import React from "react";
import type { EventPlan } from "../../../shared/types.ts";
import { usePlanDispatch, usePlanState } from "../../state/PlanContext.tsx";
import { clearSavedPlan } from "../../state/storage.ts";

function HeaderPlanIdentity({
  plan,
  onReset,
}: {
  plan: EventPlan;
  onReset: () => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-800">
        <span className="font-semibold text-slate-900">{plan.intake.name}</span>
        <span className="mx-1.5 text-slate-500">|</span>
        <span className="capitalize text-slate-700">{plan.intake.eventType}</span>
        <span className="mx-1.5 text-slate-500">|</span>
        <span className="text-slate-700">{plan.intake.date}</span>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-2"
        aria-label="Start over with a new event plan"
      >
        Start New Plan
      </button>
    </div>
  );
}

/**
 * Top header banner with brand, plan identity, and reset action.
 */
export function Header(): React.JSX.Element {
  const { plan } = usePlanState();
  const dispatch = usePlanDispatch();

  const handleReset = (): void => {
    if (window.confirm("Are you sure you want to start a new event plan? Current progress will be reset.")) {
      clearSavedPlan();
      dispatch({ type: "RESET_PLAN" });
    }
  };

  return (
    <header className="border-b border-slate-300 bg-white px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400 sm:text-3xl">
            eventhinker
          </h1>
          <p className="text-sm font-medium text-slate-700">
            Celebration & Event Planner
          </p>
        </div>

        {plan ? <HeaderPlanIdentity plan={plan} onReset={handleReset} /> : null}
      </div>
    </header>
  );
}
