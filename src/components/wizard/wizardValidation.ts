import { validateDateString } from "../../../shared/validation.ts";

const TODAY_STR = new Date().toISOString().split("T")[0] ?? "2026-11-01";

export interface WizardFields {
  name: string;
  date: string;
  guestCount: number;
  budgetMajor: number;
}

function validateStep0(name: string, date: string): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!name.trim()) errs["name"] = "Event name is required.";
  const dateVal = validateDateString(date);
  if (!dateVal.ok) {
    errs["date"] = "Please enter a valid future calendar date.";
  } else if (date < TODAY_STR) {
    errs["date"] = "Event date cannot be in the past.";
  }
  return errs;
}

function validateStep1(guestCount: number, budgetMajor: number): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!guestCount || guestCount < 1 || guestCount > 5000) {
    errs["guestCount"] = "Guest count must be between 1 and 5,000.";
  }
  if (budgetMajor < 0 || budgetMajor > 1000000000) {
    errs["budget"] = "Budget must be a non-negative amount.";
  }
  return errs;
}

export function validateStep(step: number, fields: WizardFields): Record<string, string> {
  if (step === 0) {
    return validateStep0(fields.name, fields.date);
  }
  if (step === 1) {
    return validateStep1(fields.guestCount, fields.budgetMajor);
  }
  return {};
}
