import React from "react";

export interface StepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepClick: (stepIndex: number) => void;
}

function getStepperButtonClass(isCurrent: boolean, isCompleted: boolean): string {
  if (isCurrent) return "bg-blue-800 text-white";
  if (isCompleted) return "bg-slate-200 text-slate-900 hover:bg-slate-300";
  return "bg-slate-100 text-slate-600 hover:bg-slate-200";
}

/**
 * Accessible wizard stepper indicating progress and step navigation.
 */
export function Stepper({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick,
}: StepperProps): React.JSX.Element {
  return (
    <nav aria-label="Wizard Steps" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 sm:gap-4">
        {stepLabels.map((label, index) => {
          const isCurrent = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStepClick(index)}
                aria-current={isCurrent ? "step" : undefined}
                className={`inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold sm:text-sm ${getStepperButtonClass(isCurrent, isCompleted)}`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
                  {index + 1}
                </span>
                <span>{label}</span>
              </button>
              {index < totalSteps - 1 ? (
                <span className="text-slate-400" aria-hidden="true">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
