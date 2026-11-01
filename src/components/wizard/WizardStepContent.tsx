import React from "react";
import type { BudgetTemplateCategory } from "../../../shared/data/budgetTemplates.ts";
import type { EventType } from "../../../shared/types.ts";
import { Step1Essentials } from "./Step1Essentials.tsx";
import { Step2Budget } from "./Step2Budget.tsx";
import { Step3Details } from "./Step3Details.tsx";

export interface WizardFormValues {
  eventType: EventType;
  name: string;
  date: string;
  city: string;
  guestCount: number;
  budgetMajor: number;
  currency: string;
  priorities: string[];
  themeNotes: string;
  guestNeeds: string;
  culturalTraditions: string;
}

export interface WizardFormSetters {
  setEventType: (t: EventType) => void;
  setName: (n: string) => void;
  setDate: (d: string) => void;
  setCity: (c: string) => void;
  setGuestCount: (g: number) => void;
  setBudgetMajor: (b: number) => void;
  setCurrency: (c: string) => void;
  onTogglePriority: (cat: string) => void;
  setThemeNotes: (t: string) => void;
  setGuestNeeds: (g: string) => void;
  setCulturalTraditions: (c: string) => void;
}

export interface WizardStepContentProps {
  step: number;
  values: WizardFormValues;
  setters: WizardFormSetters;
  errors: Record<string, string>;
  templateCategories: readonly BudgetTemplateCategory[];
}

export function WizardStepContent({
  step,
  values,
  setters,
  errors,
  templateCategories,
}: WizardStepContentProps): React.JSX.Element | null {
  if (step === 0) {
    return (
      <Step1Essentials
        eventType={values.eventType}
        setEventType={setters.setEventType}
        name={values.name}
        setName={setters.setName}
        date={values.date}
        setDate={setters.setDate}
        city={values.city}
        setCity={setters.setCity}
        errors={errors}
      />
    );
  }
  if (step === 1) {
    return (
      <Step2Budget
        guestCount={values.guestCount}
        setGuestCount={setters.setGuestCount}
        budgetMajor={values.budgetMajor}
        setBudgetMajor={setters.setBudgetMajor}
        currency={values.currency}
        setCurrency={setters.setCurrency}
        errors={errors}
      />
    );
  }
  if (step === 2) {
    return (
      <Step3Details
        categories={templateCategories}
        priorities={values.priorities}
        onTogglePriority={setters.onTogglePriority}
        themeNotes={values.themeNotes}
        setThemeNotes={setters.setThemeNotes}
        guestNeeds={values.guestNeeds}
        setGuestNeeds={setters.setGuestNeeds}
        culturalTraditions={values.culturalTraditions}
        setCulturalTraditions={setters.setCulturalTraditions}
      />
    );
  }
  return null;
}
