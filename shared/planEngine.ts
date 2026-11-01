/**
 * Connective Core: The Plan Engine.
 * Pure deterministic pipeline: intake -> plan (budget + timeline + vendors) -> tracking.
 */

import {
  allocateBudget,
  computeBudgetStatus,
  computeBudgetSummary,
} from "./budget.ts";
import { getInitialVendors } from "./data/vendorItems.ts";
import { buildTimeline, isTaskOverdue } from "./timeline.ts";
import type {
  BudgetCategoryItem,
  BudgetPlan,
  EventPlan,
  IntakeData,
  PlanWarning,
  TimelineTask,
  VendorItem,
} from "./types.ts";
import {
  type ValidationResult,
  validateIntakeData,
} from "./validation.ts";

/**
 * Creates a brand new event plan from validated intake and current reference date.
 * @param rawIntake - Raw or parsed intake data.
 * @param today - Current reference date YYYY-MM-DD.
 * @returns ValidationResult with populated EventPlan.
 */
export function createPlan(
  rawIntake: unknown,
  today: string,
): ValidationResult<EventPlan> {
  const intakeRes = validateIntakeData(rawIntake);
  if (!intakeRes.ok) return { ok: false, error: intakeRes.error };
  const intake = intakeRes.value;

  const timelineRes = buildTimeline(intake.date, today, intake.eventType);
  if (!timelineRes.ok) return { ok: false, error: timelineRes.error };
  const timeline = timelineRes.value;

  const categories = allocateBudget(
    intake.totalBudgetMinor,
    intake.eventType,
    intake.priorities,
  );
  const budget = computeBudgetSummary(
    categories,
    intake.currency,
    intake.guestCount,
  );
  const vendors = getInitialVendors(intake.eventType);
  const warnings = generatePlanWarnings(budget.hasOverBudget, timeline.overdueCount, timeline.compressionWarning);

  return {
    ok: true,
    value: {
      intake,
      budget,
      timeline,
      vendors,
      warnings,
      lastUpdated: today,
    },
  };
}

/**
 * Generates warning list from budget and timeline statuses.
 * @param hasOverBudget - Whether any category is over budget.
 * @param overdueCount - Number of overdue tasks.
 * @param compressionWarning - Optional timeline compression message.
 * @returns Array of PlanWarning items.
 */
export function generatePlanWarnings(
  hasOverBudget: boolean,
  overdueCount: number,
  compressionWarning?: string,
): PlanWarning[] {
  const warnings: PlanWarning[] = [];
  if (hasOverBudget) {
    warnings.push({
      id: "warn-budget-over",
      type: "budget",
      message: "One or more budget categories exceed planned allocation.",
    });
  }
  if (overdueCount > 0) {
    warnings.push({
      id: "warn-timeline-overdue",
      type: "timeline",
      message: `${overdueCount} planning milestone${overdueCount > 1 ? "s are" : " is"} past due.`,
    });
  }
  if (compressionWarning) {
    warnings.push({
      id: "warn-timeline-compressed",
      type: "timeline",
      message: compressionWarning,
    });
  }
  return warnings;
}

/**
 * Merges updated budget allocations with existing actual spend values.
 * @param freshCategories - Newly allocated categories from budget template.
 * @param existingCategories - Current categories with user actual spend.
 * @returns Merged array of BudgetCategoryItem.
 */
function mergeBudgetCategories(
  freshCategories: BudgetCategoryItem[],
  existingCategories: readonly BudgetCategoryItem[],
): BudgetCategoryItem[] {
  const actualMap = new Map<string, number>();
  for (const c of existingCategories) {
    actualMap.set(c.id, c.actualMinor);
  }
  return freshCategories.map((fresh) => {
    const actualMinor = actualMap.get(fresh.id) ?? 0;
    return {
      ...fresh,
      actualMinor,
      status: computeBudgetStatus(fresh.plannedMinor, actualMinor),
    };
  });
}

/**
 * Merges freshly scheduled timeline tasks with existing user completion flags.
 * @param freshTasks - Newly scheduled tasks.
 * @param existingTasks - Existing tasks with completed status.
 * @param today - Current reference date.
 * @returns Merged timeline task list.
 */
function mergeTimelineTasks(
  freshTasks: TimelineTask[],
  existingTasks: readonly TimelineTask[],
  today: string,
): TimelineTask[] {
  const completedMap = new Map<string, boolean>();
  for (const t of existingTasks) {
    completedMap.set(t.id, t.completed);
  }
  return freshTasks.map((task) => {
    const completed = completedMap.get(task.id) ?? false;
    return {
      ...task,
      completed,
      isOverdue: isTaskOverdue({ completed, dueDate: task.dueDate }, today),
    };
  });
}

function recomputeMergedBudget(
  intake: IntakeData,
  existingCategories: readonly BudgetCategoryItem[],
): BudgetPlan {
  const fresh = allocateBudget(intake.totalBudgetMinor, intake.eventType, intake.priorities);
  const merged = mergeBudgetCategories(fresh, existingCategories);
  return computeBudgetSummary(merged, intake.currency, intake.guestCount);
}

/**
 * Re-plans an existing event plan with updated intake parameters while preserving user progress.
 * @param plan - Current EventPlan.
 * @param intakePatch - Changes to intake parameters.
 * @param today - Current reference date YYYY-MM-DD.
 * @returns ValidationResult with updated EventPlan.
 */
export function replan(
  plan: EventPlan,
  intakePatch: Partial<IntakeData>,
  today: string,
): ValidationResult<EventPlan> {
  const mergedIntakeRaw = { ...plan.intake, ...intakePatch };
  const intakeRes = validateIntakeData(mergedIntakeRaw);
  if (!intakeRes.ok) return { ok: false, error: intakeRes.error };
  const nextIntake = intakeRes.value;

  const timelineRes = buildTimeline(nextIntake.date, today, nextIntake.eventType);
  if (!timelineRes.ok) return { ok: false, error: timelineRes.error };

  const mergedTasks = mergeTimelineTasks(timelineRes.value.tasks, plan.timeline.tasks, today);
  const overdueCount = mergedTasks.filter((t) => t.isOverdue).length;
  const budget = recomputeMergedBudget(nextIntake, plan.budget.categories);

  const vendors: VendorItem[] =
    nextIntake.eventType === plan.intake.eventType
      ? plan.vendors
      : getInitialVendors(nextIntake.eventType);

  const warnings = generatePlanWarnings(budget.hasOverBudget, overdueCount, timelineRes.value.compressionWarning);

  return {
    ok: true,
    value: {
      intake: nextIntake,
      budget,
      timeline: {
        tasks: mergedTasks,
        isCompressed: timelineRes.value.isCompressed,
        compressionWarning: timelineRes.value.compressionWarning,
        overdueCount,
      },
      vendors,
      warnings,
      lastUpdated: today,
    },
  };
}
