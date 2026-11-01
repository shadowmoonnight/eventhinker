import React from "react";

export interface WizardFooterProps {
  step: number;
  totalSteps: number;
  isExistingPlan: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function WizardFooter({
  step,
  totalSteps,
  isExistingPlan,
  onPrev,
  onNext,
}: WizardFooterProps): React.JSX.Element {
  const isLast = step === totalSteps - 1;

  return (
    <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
      {step > 0 ? (
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2"
        >
          Previous Step
        </button>
      ) : <div />}

      {!isLast ? (
        <button
          type="button"
          onClick={onNext}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-blue-800 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-900 focus-visible:outline-2"
        >
          Continue to Step {step + 2}
        </button>
      ) : (
        <button
          type="submit"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-blue-800 px-6 py-2 text-sm font-bold text-white hover:bg-blue-900 focus-visible:outline-2"
        >
          {isExistingPlan ? "Update Plan" : "Generate Plan Engine"}
        </button>
      )}
    </div>
  );
}
