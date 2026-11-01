/**
 * Validation utilities returning discriminated unions ({ ok: true } | { ok: false }).
 */

import {
  EVENT_TYPES,
  MAX_BUDGET_MINOR,
  MAX_GUESTS,
  MAX_NOTES_LENGTH,
  MAX_PRIORITY_CATEGORIES,
  MAX_STRING_LENGTH,
  MIN_BUDGET_MINOR,
  MIN_GUESTS,
  VENDOR_STATUSES,
} from "./constants.ts";
import { sanitizeStr } from "./sanitize.ts";
import type { EventType, IntakeData, VendorStatus } from "./types.ts";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

interface SanitizedIntakeParams {
  data: Record<string, unknown>;
  eventType: EventType;
  name: string;
  date: string;
  guestCount: number;
  totalBudgetMinor: number;
}

function checkCalendarValidity(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  return (
    dateObj.getUTCFullYear() === year &&
    dateObj.getUTCMonth() === month - 1 &&
    dateObj.getUTCDate() === day
  );
}

/**
 * Validates whether a date string is a valid real calendar date in YYYY-MM-DD format.
 * @param dateStr - Date string to validate.
 * @returns ValidationResult with the valid date string or an error.
 */
export function validateDateString(dateStr: unknown): ValidationResult<string> {
  if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { ok: false, error: "Date must be in YYYY-MM-DD format" };
  }
  const parts = dateStr.split("-").map((p) => parseInt(p, 10));
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (year === undefined || month === undefined || day === undefined) {
    return { ok: false, error: "Invalid date components" };
  }
  if (!checkCalendarValidity(year, month, day)) {
    return { ok: false, error: "Non-existent calendar date" };
  }
  return { ok: true, value: dateStr };
}

function parseAndValidateNumbers(
  rawGuests: unknown,
  rawBudget: unknown,
): ValidationResult<{ guests: number; budget: number }> {
  const guests = typeof rawGuests === "number" ? rawGuests : parseInt(String(rawGuests), 10);
  if (!Number.isInteger(guests) || guests < MIN_GUESTS || guests > MAX_GUESTS) {
    return { ok: false, error: `Guest count must be between ${MIN_GUESTS} and ${MAX_GUESTS}` };
  }
  const budget = typeof rawBudget === "number" ? rawBudget : parseFloat(String(rawBudget));
  if (!Number.isFinite(budget) || budget < MIN_BUDGET_MINOR || budget > MAX_BUDGET_MINOR) {
    return { ok: false, error: "Budget out of acceptable range" };
  }
  return { ok: true, value: { guests, budget: Math.floor(budget) } };
}

function validateEventBasics(data: Record<string, unknown>): ValidationResult<{
  eventType: EventType;
  name: string;
}> {
  const eventType = String(data["eventType"] ?? "") as EventType;
  if (!EVENT_TYPES.includes(eventType)) {
    return { ok: false, error: "Invalid event type" };
  }
  const name = sanitizeStr(data["name"], MAX_STRING_LENGTH);
  if (!name) {
    return { ok: false, error: "Event name is required" };
  }
  return { ok: true, value: { eventType, name } };
}

/**
 * Validates and sanitizes intake data.
 * @param raw - Unknown raw intake payload.
 * @returns ValidationResult containing the sanitized IntakeData or error.
 */
export function validateIntakeData(raw: unknown): ValidationResult<IntakeData> {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Intake data must be an object" };
  }
  const data = raw as Record<string, unknown>;
  const basics = validateEventBasics(data);
  if (!basics.ok) return basics;

  const dateRes = validateDateString(data["date"]);
  if (!dateRes.ok) return dateRes;

  const nums = parseAndValidateNumbers(data["guestCount"], data["totalBudgetMinor"]);
  if (!nums.ok) return nums;

  return {
    ok: true,
    value: buildSanitizedIntake({
      data,
      eventType: basics.value.eventType,
      name: basics.value.name,
      date: dateRes.value,
      guestCount: nums.value.guests,
      totalBudgetMinor: nums.value.budget,
    }),
  };
}

function buildSanitizedIntake(params: SanitizedIntakeParams): IntakeData {
  const prioritiesRaw = Array.isArray(params.data["priorities"]) ? params.data["priorities"] : [];
  const priorities = prioritiesRaw
    .map((p) => sanitizeStr(p, 50))
    .filter(Boolean)
    .slice(0, MAX_PRIORITY_CATEGORIES);

  return {
    eventType: params.eventType,
    name: params.name,
    date: params.date,
    guestCount: params.guestCount,
    totalBudgetMinor: params.totalBudgetMinor,
    currency: sanitizeStr(params.data["currency"], 10) || "USD",
    city: sanitizeStr(params.data["city"], MAX_STRING_LENGTH),
    priorities,
    themeNotes: sanitizeStr(params.data["themeNotes"], MAX_NOTES_LENGTH),
    guestNeeds: sanitizeStr(params.data["guestNeeds"], MAX_NOTES_LENGTH),
    culturalTraditions: sanitizeStr(params.data["culturalTraditions"], MAX_NOTES_LENGTH),
  };
}

/**
 * Validates a vendor status string.
 * @param status - Candidate status.
 * @returns ValidationResult with VendorStatus or error.
 */
export function validateVendorStatus(status: unknown): ValidationResult<VendorStatus> {
  const s = String(status ?? "") as VendorStatus;
  if (!VENDOR_STATUSES.includes(s)) {
    return { ok: false, error: "Invalid vendor status" };
  }
  return { ok: true, value: s };
}
