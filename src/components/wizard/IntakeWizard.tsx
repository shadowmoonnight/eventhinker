import React, { useRef, useState } from "react";
import { getBudgetTemplate } from "../../../shared/data/budgetTemplates.ts";
import { usePlanState } from "../../state/PlanContext.tsx";
import { Stepper } from "./Stepper.tsx";
import { useAutostartEffect, useWizardFields, useWizardSubmit } from "./useWizardForm.ts";
import { WizardErrorSummary } from "./WizardErrorSummary.tsx";
import { WizardFooter } from "./WizardFooter.tsx";
import { WizardStepContent } from "./WizardStepContent.tsx";

const STEP_LABELS = ["Event Essentials", "Headcount & Budget", "Priorities & Details"];

/**
 * Intake Wizard orchestrating 3 steps to initialize or update the EventCraft Plan Engine.
 */
export function IntakeWizard(): React.JSX.Element {
  const { plan } = usePlanState();
  const [step, setStep] = useState<number>(0);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useAutostartEffect();
  const { values, setters } = useWizardFields(plan);
  const { errors, validateCurrentStep, handleNext, handleSubmit } = useWizardSubmit(
    values,
    step,
    setStep,
    errorSummaryRef,
  );

  const templateCategories = getBudgetTemplate(values.eventType);

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-6 shadow-xs sm:p-8">
      <h2 id="section-heading-wizard" tabIndex={-1} className="text-2xl font-bold tracking-tight text-slate-900 outline-none">
        {plan ? "Update Event Parameters" : "Create Your Event Plan"}
      </h2>
      <p className="mt-1 text-sm text-slate-700">
        Enter criteria to generate an interconnected budget, backward timeline, and vendor checklist.
      </p>

      <div className="mt-6">
        <Stepper
          currentStep={step}
          totalSteps={STEP_LABELS.length}
          stepLabels={STEP_LABELS}
          onStepClick={(i) => {
            if (i < step || validateCurrentStep()) setStep(i);
          }}
        />
      </div>

      <WizardErrorSummary errors={errors} summaryRef={errorSummaryRef} />

      <form onSubmit={handleSubmit} noValidate>
        <h3 id="wizard-step-heading" tabIndex={-1} className="text-lg font-bold text-slate-900 outline-none">
          Step {step + 1}: {STEP_LABELS[step]}
        </h3>

        <WizardStepContent
          step={step}
          values={values}
          setters={setters}
          errors={errors}
          templateCategories={templateCategories}
        />

        <WizardFooter
          step={step}
          totalSteps={STEP_LABELS.length}
          isExistingPlan={Boolean(plan)}
          onPrev={() => setStep((s) => s - 1)}
          onNext={handleNext}
        />
      </form>
    </div>
  );
}
