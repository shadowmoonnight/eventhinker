/* eslint-disable no-control-regex */
/**
 * Sanitization utilities for strings and numbers.
 */

import { MAX_STRING_LENGTH } from "./constants.ts";

/**
 * Strips non-printable ASCII control characters, trims, and truncates a string.
 * @param val - The raw input to sanitize.
 * @param maxLen - Maximum allowed character length.
 * @returns Sanitized clean string.
 */
export function sanitizeStr(val: unknown, maxLen = MAX_STRING_LENGTH): string {
  return String(val ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, maxLen);
}

/**
 * Parses and clamps a numeric value between bounds with a fallback.
 * @param val - Raw input value.
 * @param min - Minimum allowed number.
 * @param max - Maximum allowed number.
 * @param fallback - Fallback value if parsed number is invalid.
 * @returns Clamped finite number.
 */
export function clampNumber(
  val: unknown,
  min: number,
  max: number,
  fallback = min,
): number {
  const n = typeof val === "number" ? val : parseFloat(String(val));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}
