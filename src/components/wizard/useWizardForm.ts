import { useCallback, useEffect, useMemo, useState } from "react";
import { MAX_PRIORITY_CATEGORIES } from "../../../shared/constants.ts";
import { createPlan } from "../../../shared/planEngine.ts";
import type { EventPlan, IntakeData } from "../../../shared/types.ts";
import { usePlanDispatch, usePlanState } from "../../state/PlanContext.tsx";
import type { WizardFormSetters, WizardFormValues } from "./WizardStepContent.tsx";
import { validateStep, type WizardFields } from "./wizardValidation.ts";

const TODAY_STR = new Date().toISOString().split("T")[0] ?? "2026-11-01";

const DEFAULT_WIZARD_VALUES: WizardFormValues = {
  eventType: "wedding",
  name: "",
  date: "",
  city: "",
  guestCount: 100,
  budgetMajor: 25000,
  currency: "USD",
  priorities: [],
  themeNotes: "",
  guestNeeds: "",
  culturalTraditions: "",
};

function initialWizardValues(plan: EventPlan | null): WizardFormValues {
  if (!plan) return DEFAULT_WIZARD_VALUES;
  const { intake } = plan;
  return {
    eventType: intake.eventType,
    name: intake.name,
    date: intake.date,
    city: intake.city,
    guestCount: intake.guestCount,
    budgetMajor: Math.floor(intake.totalBudgetMinor / 100),
    currency: intake.currency,
    priorities: intake.priorities,
    themeNotes: intake.themeNotes,
    guestNeeds: intake.guestNeeds,
    culturalTraditions: intake.culturalTraditions,
  };
}

export interface UseWizardFieldsReturn {
  values: WizardFormValues;
  setters: WizardFormSetters;
}

export function useWizardFields(plan: EventPlan | null): UseWizardFieldsReturn {
  const [form, setForm] = useState<WizardFormValues>(() => initialWizardValues(plan));

  const updateField = useCallback(<K extends keyof WizardFormValues>(key: K, value: WizardFormValues[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onTogglePriority = useCallback((catName: string): void => {
    setForm((prev) => {
      if (prev.priorities.includes(catName)) {
        return { ...prev, priorities: prev.priorities.filter((p) => p !== catName) };
      }
      if (prev.priorities.length < MAX_PRIORITY_CATEGORIES) {
        return { ...prev, priorities: [...prev.priorities, catName] };
      }
      return prev;
    });
  }, []);

  const setters: WizardFormSetters = useMemo(() => ({
    setEventType: (t) => updateField("eventType", t),
    setName: (n) => updateField("name", n),
    setDate: (d) => updateField("date", d),
    setCity: (c) => updateField("city", c),
    setGuestCount: (g) => updateField("guestCount", g),
    setBudgetMajor: (b) => updateField("budgetMajor", b),
    setCurrency: (c) => updateField("currency", c),
    onTogglePriority,
    setThemeNotes: (t) => updateField("themeNotes", t),
    setGuestNeeds: (g) => updateField("guestNeeds", g),
    setCulturalTraditions: (c) => updateField("culturalTraditions", c),
  }), [updateField, onTogglePriority]);

  return { values: form, setters };
}

export function useAutostartEffect(): void {
  const { plan } = usePlanState();
  const dispatch = usePlanDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("autostart") === "1" && !plan) {
      const demoIntake: IntakeData = {
        eventType: "wedding",
        name: "Elena & David Wedding Celebration",
        date: "2027-08-15",
        guestCount: 120,
        totalBudgetMinor: 3000000,
        currency: "USD",
        city: "San Francisco",
        priorities: ["Venue", "Catering & Bar", "Photography & Video"],
        themeNotes: "Modern botanical elegance with olive and sage accents",
        guestNeeds: "3 vegan guests, 1 wheelchair accessible entrance",
        culturalTraditions: "Traditional evening toast",
      };
      const res = createPlan(demoIntake, TODAY_STR);
      if (res.ok) dispatch({ type: "SET_PLAN", payload: res.value });
    }
  }, [plan, dispatch]);
}

function submitIntake(
  values: WizardFormValues,
  plan: EventPlan | null,
  dispatch: ReturnType<typeof usePlanDispatch>,
): void {
  const payload: IntakeData = {
    eventType: values.eventType,
    name: values.name.trim(),
    date: values.date,
    guestCount: values.guestCount,
    totalBudgetMinor: Math.round(values.budgetMajor * 100),
    currency: values.currency,
    city: values.city.trim(),
    priorities: values.priorities,
    themeNotes: values.themeNotes.trim(),
    guestNeeds: values.guestNeeds.trim(),
    culturalTraditions: values.culturalTraditions.trim(),
  };

  if (plan) {
    dispatch({ type: "UPDATE_INTAKE", payload: { patch: payload, today: TODAY_STR } });
    dispatch({ type: "SET_SECTION", payload: "budget" });
  } else {
    const res = createPlan(payload, TODAY_STR);
    if (res.ok) dispatch({ type: "SET_PLAN", payload: res.value });
  }
}

export interface UseWizardSubmitReturn {
  errors: Record<string, string>;
  validateCurrentStep: () => boolean;
  handleNext: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function useWizardSubmit(
  values: WizardFormValues,
  step: number,
  setStep: React.Dispatch<React.SetStateAction<number>>,
  errorSummaryRef: React.RefObject<HTMLDivElement | null>,
): UseWizardSubmitReturn {
  const { plan } = usePlanState();
  const dispatch = usePlanDispatch();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCurrentStep = useCallback((): boolean => {
    const fields: WizardFields = {
      name: values.name,
      date: values.date,
      guestCount: values.guestCount,
      budgetMajor: values.budgetMajor,
    };
    const stepErrors = validateStep(step, fields);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      setTimeout(() => errorSummaryRef.current?.focus(), 50);
      return false;
    }
    return true;
  }, [step, values, errorSummaryRef]);

  const handleNext = useCallback((): void => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(prev + 1, 2));
      setTimeout(() => document.getElementById("wizard-step-heading")?.focus(), 50);
    }
  }, [validateCurrentStep, setStep]);

  const handleSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault();
    if (validateCurrentStep()) submitIntake(values, plan, dispatch);
  }, [validateCurrentStep, values, plan, dispatch]);

  return { errors, validateCurrentStep, handleNext, handleSubmit };
}
