/**
 * Storage persistence layer for EventCraft with fail-safe validation.
 */

import type { EventPlan } from "../../shared/types.ts";

export const STORAGE_KEY = "eventcraft_plan_v1";

function isValidStoredPlan(obj: unknown): obj is EventPlan {
  if (!obj || typeof obj !== "object") return false;
  const p = obj as Record<string, unknown>;
  const hasIntake = Boolean(p["intake"] && typeof p["intake"] === "object");
  const hasBudget = Boolean(p["budget"] && typeof p["budget"] === "object");
  const hasTimeline = Boolean(p["timeline"] && typeof p["timeline"] === "object");
  const hasVendors = Array.isArray(p["vendors"]);
  return hasIntake && hasBudget && hasTimeline && hasVendors;
}

/**
 * Loads and validates saved EventPlan from localStorage.
 * Falls back to null if corrupted, missing, or invalid.
 * @returns Parsed EventPlan or null.
 */
export function loadSavedPlan(): EventPlan | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isValidStoredPlan(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Safely saves EventPlan to localStorage.
 * @param plan - The EventPlan to persist.
 * @returns True if saved successfully, false otherwise.
 */
export function savePlan(plan: EventPlan): boolean {
  try {
    if (!isValidStoredPlan(plan)) return false;
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(plan));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clears the stored plan from localStorage.
 */
export function clearSavedPlan(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage clear failures
  }
}
