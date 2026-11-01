/**
 * Pure vendor checklist management and validation.
 */

import { sanitizeStr } from "./sanitize.ts";
import type { VendorItem, VendorStatus } from "./types.ts";
import { type ValidationResult, validateVendorStatus } from "./validation.ts";

export type VendorItemPatch = Partial<
  Pick<VendorItem, "status" | "quoteMinor" | "notes" | "questionsToAsk" | "redFlags">
>;

function parseQuoteMinor(val: unknown): ValidationResult<number> {
  const rawQuote = typeof val === "number" ? val : parseFloat(String(val));
  if (!Number.isFinite(rawQuote) || rawQuote < 0 || rawQuote > 100_000_000_000) {
    return { ok: false, error: "Quote amount must be non-negative" };
  }
  return { ok: true, value: Math.floor(rawQuote) };
}

/**
 * Validates and updates a vendor item's status, quote, or notes.
 * @param item - Existing vendor item.
 * @param patch - Fields to update.
 * @returns ValidationResult with updated VendorItem.
 */
export function updateVendorItem(
  item: VendorItem,
  patch: VendorItemPatch,
): ValidationResult<VendorItem> {
  let nextStatus: VendorStatus = item.status;
  if (patch.status !== undefined) {
    const statusRes = validateVendorStatus(patch.status);
    if (!statusRes.ok) return { ok: false, error: statusRes.error };
    nextStatus = statusRes.value;
  }

  let nextQuote = item.quoteMinor;
  if (patch.quoteMinor !== undefined) {
    const quoteRes = parseQuoteMinor(patch.quoteMinor);
    if (!quoteRes.ok) return quoteRes;
    nextQuote = quoteRes.value;
  }

  const nextNotes =
    patch.notes !== undefined ? sanitizeStr(patch.notes, 1000) : item.notes;

  return {
    ok: true,
    value: {
      ...item,
      status: nextStatus,
      quoteMinor: nextQuote,
      notes: nextNotes,
      questionsToAsk: patch.questionsToAsk !== undefined ? patch.questionsToAsk : item.questionsToAsk,
      redFlags: patch.redFlags !== undefined ? patch.redFlags : item.redFlags,
    },
  };
}

/**
 * Computes total booked and quoted amounts across vendor items.
 * @param vendors - Array of vendor items.
 * @returns Object with totalBookedMinor and totalQuotedMinor in minor cents.
 */
export function summarizeVendors(vendors: readonly VendorItem[]): {
  totalBookedMinor: number;
  totalQuotedMinor: number;
  bookedCount: number;
} {
  let totalBookedMinor = 0;
  let totalQuotedMinor = 0;
  let bookedCount = 0;

  for (const v of vendors) {
    if (v.status === "booked") {
      totalBookedMinor += v.quoteMinor;
      bookedCount++;
    } else if (v.status === "quoted") {
      totalQuotedMinor += v.quoteMinor;
    }
  }

  return { totalBookedMinor, totalQuotedMinor, bookedCount };
}
