/**
 * Pure reducer managing EventCraft plan state.
 */

import { computeBudgetStatus, computeBudgetSummary } from "../../shared/budget.ts";
import { generatePlanWarnings, replan } from "../../shared/planEngine.ts";
import type { EventPlan, IntakeData } from "../../shared/types.ts";
import { updateVendorItem, type VendorItemPatch } from "../../shared/vendors.ts";

export interface PlanState {
  plan: EventPlan | null;
  activeSection: "wizard" | "budget" | "timeline" | "vendors" | "ideas" | "assistant" | "summary";
  notification: string | null;
}

export type PlanAction =
  | { type: "SET_PLAN"; payload: EventPlan }
  | { type: "SET_SECTION"; payload: PlanState["activeSection"] }
  | { type: "SET_NOTIFICATION"; payload: string | null }
  | { type: "UPDATE_INTAKE"; payload: { patch: Partial<IntakeData>; today: string } }
  | { type: "UPDATE_BUDGET_ACTUAL"; payload: { categoryId: string; actualMinor: number } }
  | { type: "TOGGLE_TASK"; payload: { taskId: string; today: string } }
  | {
      type: "UPDATE_VENDOR";
      payload: {
        vendorId: string;
        patch: VendorItemPatch;
      };
    }
  | { type: "RESET_PLAN" };

export const initialPlanState: PlanState = {
  plan: null,
  activeSection: "wizard",
  notification: null,
};

function handleToggleTask(plan: EventPlan, taskId: string, today: string): EventPlan {
  const tasks = plan.timeline.tasks.map((t) => {
    if (t.id !== taskId) return t;
    const completed = !t.completed;
    return {
      ...t,
      completed,
      isOverdue: !completed && t.dueDate < today,
    };
  });
  const overdueCount = tasks.filter((t) => t.isOverdue).length;
  const warnings = generatePlanWarnings(
    plan.budget.hasOverBudget,
    overdueCount,
    plan.timeline.compressionWarning,
  );
  return {
    ...plan,
    timeline: { ...plan.timeline, tasks, overdueCount },
    warnings,
    lastUpdated: today,
  };
}

function handleBudgetActual(plan: EventPlan, categoryId: string, actualMinor: number): EventPlan {
  const safeActual = Math.max(0, Math.floor(actualMinor));
  const categories = plan.budget.categories.map((c) => {
    if (c.id !== categoryId) return c;
    return {
      ...c,
      actualMinor: safeActual,
      status: computeBudgetStatus(c.plannedMinor, safeActual),
    };
  });
  const budget = computeBudgetSummary(categories, plan.intake.currency, plan.intake.guestCount);
  const warnings = generatePlanWarnings(
    budget.hasOverBudget,
    plan.timeline.overdueCount,
    plan.timeline.compressionWarning,
  );
  return { ...plan, budget, warnings };
}

function handleUpdateVendor(
  plan: EventPlan,
  vendorId: string,
  patch: VendorItemPatch,
): EventPlan {
  const vendors = plan.vendors.map((v) => {
    if (v.id !== vendorId) return v;
    const res = updateVendorItem(v, patch);
    return res.ok ? res.value : v;
  });
  return { ...plan, vendors };
}

function handlePlanSpecificAction(plan: EventPlan, action: PlanAction): EventPlan | null {
  if (action.type === "UPDATE_INTAKE") {
    const res = replan(plan, action.payload.patch, action.payload.today);
    return res.ok ? res.value : plan;
  }
  if (action.type === "UPDATE_BUDGET_ACTUAL") {
    return handleBudgetActual(plan, action.payload.categoryId, action.payload.actualMinor);
  }
  if (action.type === "TOGGLE_TASK") {
    return handleToggleTask(plan, action.payload.taskId, action.payload.today);
  }
  if (action.type === "UPDATE_VENDOR") {
    return handleUpdateVendor(plan, action.payload.vendorId, action.payload.patch);
  }
  return null;
}

/**
 * Pure reducer function for plan state with low cyclomatic complexity.
 */
export function planReducer(state: PlanState, action: PlanAction): PlanState {
  if (action.type === "SET_PLAN") {
    return { ...state, plan: action.payload, activeSection: "budget", notification: "Plan created successfully" };
  }
  if (action.type === "SET_SECTION") {
    return { ...state, activeSection: action.payload };
  }
  if (action.type === "SET_NOTIFICATION") {
    return { ...state, notification: action.payload };
  }
  if (action.type === "RESET_PLAN") {
    return { ...initialPlanState };
  }
  if (!state.plan) {
    return state;
  }
  const nextPlan = handlePlanSpecificAction(state.plan, action);
  return nextPlan ? { ...state, plan: nextPlan, notification: "Plan updated" } : state;
}
