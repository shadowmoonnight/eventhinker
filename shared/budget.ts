/**
 * Pure budget calculation and allocation using largest-remainder method.
 * All amounts are integers in minor units (cents).
 */

import {
  BUDGET_STATUS_THRESHOLDS,
  PRIORITY_MULTIPLIER,
} from "./constants.ts";
import { getBudgetTemplate } from "./data/budgetTemplates.ts";
import type {
  BudgetCategoryItem,
  BudgetPlan,
  BudgetStatus,
  EventType,
} from "./types.ts";

interface WeightedCategory {
  id: string;
  name: string;
  templatePercent: number;
  weight: number;
  isPriority: boolean;
  isContingency: boolean;
  index: number;
}

/**
 * Calculates budget status based on actual vs planned minor units.
 * @param plannedMinor - Budgeted amount in minor cents.
 * @param actualMinor - Actual spend in minor cents.
 * @returns Status: 'under' | 'near' | 'over'.
 */
export function computeBudgetStatus(
  plannedMinor: number,
  actualMinor: number,
): BudgetStatus {
  if (plannedMinor <= 0) {
    return actualMinor > 0 ? "over" : "under";
  }
  if (actualMinor > plannedMinor) {
    return "over";
  }
  const ratio = actualMinor / plannedMinor;
  if (ratio >= BUDGET_STATUS_THRESHOLDS.NEAR_RATIO) {
    return "near";
  }
  return "under";
}

/**
 * Computes normalized share weights enforcing priority boost and contingency floor.
 * @param categories - Array of categories with weights.
 * @returns Array of final normalized fractional shares summing to 1.
 */
function computeNormalizedShares(categories: readonly WeightedCategory[]): number[] {
  if (categories.length === 0) return [];
  if (categories.length === 1) return [1.0];

  const contIndex = categories.findIndex((c) => c.isContingency);
  const contCat = contIndex >= 0 ? categories[contIndex] : undefined;
  const contFloor = contCat ? contCat.templatePercent / 100 : 0;

  const sumRaw = categories.reduce((sum, c) => sum + c.weight, 0);
  const rawContShare = contCat && sumRaw > 0 ? contCat.weight / sumRaw : 0;
  const finalContShare = Math.max(contFloor, rawContShare);

  const nonContSum = categories.reduce((sum, c, i) => (i === contIndex ? sum : sum + c.weight), 0);
  const remainingFraction = Math.max(0, 1.0 - finalContShare);

  return categories.map((c, i) => {
    if (i === contIndex) return finalContShare;
    return nonContSum > 0 ? (c.weight / nonContSum) * remainingFraction : 0;
  });
}

/**
 * Distributes an integer total across categories using largest-remainder method.
 * @param totalMinor - Total amount in minor units.
 * @param shares - Normalized decimal shares per category.
 * @returns Array of integer allocations summing exactly to totalMinor.
 */
function distributeLargestRemainder(totalMinor: number, shares: number[]): number[] {
  if (totalMinor <= 0 || shares.length === 0) {
    return new Array<number>(shares.length).fill(0);
  }
  const exacts = shares.map((s) => s * totalMinor);
  const bases = exacts.map((e) => Math.floor(e));
  const remainders = exacts.map((e, i) => ({
    index: i,
    rem: e - (bases[i] ?? 0),
  }));

  const baseSum = bases.reduce((sum, b) => sum + b, 0);
  let missing = totalMinor - baseSum;

  remainders.sort((a, b) => {
    if (b.rem !== a.rem) return b.rem - a.rem;
    return a.index - b.index;
  });

  const result = [...bases];
  for (let k = 0; k < remainders.length && missing > 0; k++) {
    const item = remainders[k];
    if (item) {
      result[item.index] = (result[item.index] ?? 0) + 1;
      missing--;
    }
  }
  return result;
}

/**
 * Allocates budget with priority boosts, contingency protection, and exact minor sums.
 * @param totalMinor - Total budget in minor units (cents).
 * @param type - Event type.
 * @param priorities - Priority category names or ids.
 * @returns Array of BudgetCategoryItem objects.
 */
export function allocateBudget(
  totalMinor: number,
  type: EventType,
  priorities: readonly string[],
): BudgetCategoryItem[] {
  const template = getBudgetTemplate(type);
  const weighted: WeightedCategory[] = template.map((cat, index) => {
    const isPriority = priorities.some(
      (p) => p.toLowerCase() === cat.id.toLowerCase() || p.toLowerCase() === cat.name.toLowerCase(),
    );
    const weight = cat.percent * (isPriority ? PRIORITY_MULTIPLIER : 1.0);
    return {
      id: cat.id,
      name: cat.name,
      templatePercent: cat.percent,
      weight,
      isPriority,
      isContingency: Boolean(cat.isContingency || cat.id === "contingency"),
      index,
    };
  });

  const shares = computeNormalizedShares(weighted);
  const allocations = distributeLargestRemainder(Math.max(0, totalMinor), shares);

  return weighted.map((w, i) => {
    const plannedMinor = allocations[i] ?? 0;
    return {
      id: w.id,
      name: w.name,
      templatePercent: w.templatePercent,
      weight: w.weight,
      plannedMinor,
      actualMinor: 0,
      status: computeBudgetStatus(plannedMinor, 0),
      isPriority: w.isPriority,
    };
  });
}

/**
 * Recomputes aggregate budget summary from category items.
 * @param categories - Category items with planned and actual amounts.
 * @param currency - Currency symbol or code.
 * @param guestCount - Guest count for per-guest calculation.
 * @returns Complete BudgetPlan structure.
 */
export function computeBudgetSummary(
  categories: BudgetCategoryItem[],
  currency: string,
  guestCount: number,
): BudgetPlan {
  const totalPlannedMinor = categories.reduce((s, c) => s + c.plannedMinor, 0);
  const totalActualMinor = categories.reduce((s, c) => s + c.actualMinor, 0);
  const remainingMinor = totalPlannedMinor - totalActualMinor;
  const perGuestCostMinor = guestCount > 0 ? Math.round(totalPlannedMinor / guestCount) : 0;
  const hasOverBudget = categories.some((c) => c.status === "over");

  return {
    totalPlannedMinor,
    totalActualMinor,
    remainingMinor,
    perGuestCostMinor,
    categories,
    currency,
    hasOverBudget,
  };
}
